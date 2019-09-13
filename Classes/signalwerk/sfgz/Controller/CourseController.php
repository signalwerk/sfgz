<?php
//  ./flow flow:package:rescan
//  see also: https://github.com/robertlemke/RobertLemke.Plugin.Blog

namespace signalwerk\sfgz\Controller;

use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeTemplate;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Domain\Service\Context;
use Neos\ContentRepository\Utility;
use Handlebars\Handlebars;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use \stdClass;
use \DOMDocument;

/**
 * Courses controller for the site package
 */
class CourseController extends ActionController
{
    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * @var Context
     */
    protected $context;

    /**
     * Initialize the context
     *
     * @return void
     */
    protected function initializeAction()
    {
        $this->context = $this->contextFactory->create(array('workspaceName' => 'live'));
    }

    protected function dataPath()
    {
        return dirname(getcwd())."/Data/API/";
    }

    protected function backupPath()
    {
        return $this->dataPath()."backup/".date("Y")."/".date("m")."/";
    }

    protected function backupFilePath()
    {
        return $this->backupPath().date("Y-m-d")."___".date("H-i-s")."___".date("U");
    }


    protected function getRootOfImport()
    {
        $q = new FlowQuery(array($this->context->getRootNode()));

        $courseNode = $q->find('[instanceof Neos.Neos:Document]')->children('[uriPathSegment="course"]')->get(0);
        $mainCollectionNode = $courseNode->getNode('main');

        return $mainCollectionNode;
    }


    /**
     * Signals that a course node was deleted.
     *
     * @Flow\Signal
     * @param NodeInterface $node
     * @return void
     */
    protected function emitCourseDeleted(NodeInterface $node)
    {
    }

    /**
     * @param string $email
     * @return void
     */
    protected function deleteAllCourses()
    {
        $msg = '';
        // ------------------------------------------------

        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:CourseExecution]');

        $msg .= '<p>Alte Durchführungen gelöschen: ' . count($query) .'x</p>';

        foreach ($query as $courseExecution) {
            $courseExecution->remove();
            $this->emitCourseDeleted($courseExecution);
        }

        // ------------------------------------------------

        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:CourseCategory]');

        $msg .= '<p>Alte Kategorien gelöschen: ' . count($query) .'x</p>';

        foreach ($query as $courseCategory) {
            $courseCategory->remove();
            $this->emitCourseDeleted($courseCategory);
        }

        // ------------------------------------------------


        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:Course]');

        $msg .= '<p>Alte Kurse gelöschen: ' . count($query) .'x</p>';

        foreach ($query as $course) {
            $course->remove();
            $this->emitCourseDeleted($course);
        }

        $this->persistenceManager->persistAll();

        return $msg;
    }


    protected function emailCourse($data)
    {
        $engine = new Handlebars;

        $path = dirname(getcwd())."/Packages/Sites/signalwerk.sfgz/Classes/signalwerk/sfgz/Controller";
        $templateMail = file_get_contents($path ."/mail.hbs").file_get_contents($path ."/mail__facts.hbs");


        // generate mail text
        $mailtxt = $engine->render($templateMail, $data);

        // To create the nested structure
        if (!file_exists($this->backupPath())) {
            if (!mkdir($this->backupPath(), 0777, true)) {
                die('Failed to create mail (save)...');
            }
        }

        // save backup
        file_put_contents($this->backupFilePath().'_mail.txt', $mailtxt);
        file_put_contents($this->backupFilePath().'_mail.json', json_encode($data, JSON_PRETTY_PRINT));

        $mail = new PHPMailer;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom('weiterbildung@sfgz.ch', 'SfGZ – Weiterbildung');
        $mail->addAddress($data->{'E-Mail'});
        // $mail->addBCC('sh@signalwerk.ch');

        $mail->Subject = 'Ihre Anmeldung - '.$data->title;
        $mail->Body = $mailtxt;

        //send the message, check for errors
        if (!$mail->send()) {
            $msg = "Mailer Error: " . $mail->ErrorInfo;
            file_put_contents($this->backupFilePath().'_mail_error.txt', $msg);
        } else {
            $msg = "<h1>Danke für die Anmeldung!</h1>";
        }


        // mail an die Verwaltung

        $templateMail = file_get_contents($path ."/mail__facts.hbs");
        $mailtxt = $engine->render($templateMail, $data);

        $mailVerwaltung = new PHPMailer;
        $mailVerwaltung->CharSet = 'UTF-8';
        $mailVerwaltung->setFrom('weiterbildung@sfgz.ch', 'SfGZ – Weiterbildung');
        $mailVerwaltung->addAddress('weiterbildung@sfgz.zh.ch');
        // $mailVerwaltung->addBCC('sh@signalwerk.ch');

        $mailVerwaltung->Subject = 'Kursanmeldung - '.$data->Vorname.' '.$data->Name.', '.$data->Ort;
        $mailVerwaltung->Body = $mailtxt;

        //send the message, check for errors
        if (!$mailVerwaltung->send()) {
            $msg .= "Mailer Error: " . $mailVerwaltung->ErrorInfo;
            file_put_contents($this->backupFilePath().'_mailVerwaltung_error.txt', $msg);
        } else {
            $msg .= "<h3>Mail an die Verwaltung versendet.</h3>";
        }


        return $msg;
    }


    // to export in open eco
    protected function exportCourse($data)
    {

      /* create a dom document with encoding utf8 */
        $domtree = new DOMDocument('1.0', 'UTF-8');
        $domtree->formatOutput = true;

        /* create the root element of the xml tree */
        $xmlRoot = $domtree->createElement("anmeldungen");
        $xmlRoot->setAttribute('created', date("d.m.Y H:i:s"));

        /* append it to the document created */
        $xmlRoot = $domtree->appendChild($xmlRoot);

        $anmeldung = $domtree->createElement("Anmeldung");
        $anmeldung = $xmlRoot->appendChild($anmeldung);

        /* save all the fields */
        $anmeldung->appendChild($domtree->createElement('KursID', $data->ecoAngebotId));
        $anmeldung->appendChild($domtree->createElement('KlassenID', $data->ecoFachId));
        $anmeldung->appendChild($domtree->createElement('Anrede', $data->anrede));
        $anmeldung->appendChild($domtree->createElement('Name', $data->Name));
        $anmeldung->appendChild($domtree->createElement('Vorname', $data->Vorname));
        $anmeldung->appendChild($domtree->createElement('Strasse', $data->Strasse." ".$data->StrasseNr));
        $anmeldung->appendChild($domtree->createElement('StrName', $data->Strasse));
        $anmeldung->appendChild($domtree->createElement('StrNr', $data->StrasseNr));
        $anmeldung->appendChild($domtree->createElement('PLZ', $data->Postleitzahl));
        $anmeldung->appendChild($domtree->createElement('Ort', $data->Ort));
        $anmeldung->appendChild($domtree->createElement('TelefonP', $data->TelP));
        $anmeldung->appendChild($domtree->createElement('TelefonG', $data->TelG));
        $anmeldung->appendChild($domtree->createElement('Mobile', $data->TelM));
        $anmeldung->appendChild($domtree->createElement('Email', $data->{'E-Mail'}));
        $anmeldung->appendChild($domtree->createElement('Geburtsdatum', $data->Geburtsdatum));
        $anmeldung->appendChild($domtree->createElement('AgName1', $data->bill_company));
        $anmeldung->appendChild($domtree->createElement('AgName2', $data->bill_anrede." ".$data->bill_Vorname." ".$data->bill_Name));
        $anmeldung->appendChild($domtree->createElement('AgStrasse', $data->bill_Strasse." ".$data->bill_StrasseNr));
        $anmeldung->appendChild($domtree->createElement('AgStrName', $data->bill_Strasse));
        $anmeldung->appendChild($domtree->createElement('AgStrNr', $data->bill_StrasseNr));
        $anmeldung->appendChild($domtree->createElement('AgPLZ', $data->bill_Postleitzahl));
        $anmeldung->appendChild($domtree->createElement('AgOrt', $data->bill_Ort));
        // $anmeldung->appendChild($domtree->createElement('Bemerkung', $data->Comment ));

        // save local copy
        $domtree->save($this->backupFilePath().'_export.xml');

        // save for export
        $exportPath = $this->dataPath()."import/ecoopen/";
        // To create the nested structure
        if (!file_exists($exportPath)) {
            if (!mkdir($exportPath, 0777, true)) {
                die('Failed to create xml (save)...');
            }
        }
        // write export
        $domtree->save($exportPath."MBA_ZH_53_".date("U").'.xml');

        return " xml written. ";
        // file_put_contents($this->backupFilePath().'_mail.json', json_encode($data, JSON_PRETTY_PRINT));
    }


    protected function dlCourseXML()
    {
        set_time_limit(0); // unlimited max execution time

        $ci = curl_init();
        $url = "https://daten.sfgz.ch/?type=90"; // Source file
      $fp = fopen($this->dataPath().'getxml.xml', "w"); // Destination location
      curl_setopt_array($ci, array(
          CURLOPT_URL => $url,
          CURLOPT_TIMEOUT => 28800, // set this to 8 hours so we dont timeout on big files
          CURLOPT_FILE => $fp
      ));
        $contents = curl_exec($ci); // Returns '1' if successful
        curl_close($ci);
        fclose($fp);
    }

    /**
     * @var array
     */
    protected $tagNodes = [];


    /**
     * @param array $tags
     * @return array<NodeInterface>
     */
    protected function getTagNodes(array $tags, $rootNode)
    {
        $tagNodes = [];
        foreach ($tags as $tag) {
            $title = $tag['title'];
            $sort = $tag['sort'];
            $type = $tag['type'];
            $md5Tag=md5($title.$sort.$type);
            if (!isset($this->tagNodes[$md5Tag])) {
                $tagNodeType = $this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseCategory');
                $name = Utility::renderValidNodeName($title);
                //  $name = uniqid('node');
                $tagNode = $rootNode->createNode($name, $tagNodeType);
                $tagNode->setProperty('title', $title);
                $tagNode->setProperty('sort', $sort);
                $tagNode->setProperty('type', $type);
                $this->tagNodes[$md5Tag] = $tagNode;
            }
            $tagNodes[] = $this->tagNodes[$md5Tag];
        }

        return $tagNodes;
    }

    // remove text references with the link
    protected function linkText($text)
    {
        return str_replace('#REP_URL#', './detail.html?kurs=', $text);
    }

    protected function importCourse()
    {
        $this->dlCourseXML();

        $rootNode = $this->getRootOfImport();

        if ($rootNode === null) {
            return 'Expected course root not found! [uriPathSegment="course"]';
        }

        $path = dirname(getcwd())."/Packages/Sites/signalwerk.sfgz/Classes/signalwerk/sfgz/Controller";
        $xmlString = file_get_contents($this->dataPath().'getxml.xml');

        $xml = simplexml_load_string($xmlString);

        // build up an array to late look up kategoriegruppe by kategoriename
        $categories = [];
        foreach ($xml->kategorien->kategorie as $kategoriegruppe) {
            foreach ($kategoriegruppe->kategorie as $kategorie) {
                $categories[strval($kategorie)] = strval($kategoriegruppe['name']);
            }
        }

        // foreach([$xml->kurse->kurs[0]] as $kurs)
        foreach ($xml->kurse->kurs as $kurs) {
            foreach ($kurs->versionen->version as $version) {

//              $links = [];
//
//              if (!empty($version->links->link)) {
//                foreach ($version->links->link as $link) {
//                  $links[] = ['id' => strval($link->nummer), 'titel' => $link->titel, 'url' => $link->url];
//                }
//              }

                $courseNodeTemplate = new NodeTemplate();
                $courseNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:Course'));

                $courseNodeTemplate->setProperty('coursid', $kurs->{'kurs-code'});
                $courseNodeTemplate->setProperty('title', $version->titel);
                $courseNodeTemplate->setProperty('subtitle', $version->{'sub-titel'});

                $courseNodeTemplate->setProperty('ziel', $this->linkText($version->ziel));
                $courseNodeTemplate->setProperty('inhalt', $this->linkText($version->inhalt));
                $courseNodeTemplate->setProperty('stufe', $this->linkText($kurs->{'stufe-wb'}));
                $courseNodeTemplate->setProperty('zielgruppe', $this->linkText($version->zielgruppe));
                $courseNodeTemplate->setProperty('voraussetzungen', $this->linkText($version->voraussetzungen));
                $courseNodeTemplate->setProperty('methode', $this->linkText($version->methode));
                $courseNodeTemplate->setProperty('kursmittel', $this->linkText($version->kursunterlagen));
                $courseNodeTemplate->setProperty('hinweis', $this->linkText($version->hinweis));
                $courseNodeTemplate->setProperty('weitereinfos', $this->linkText($version->{'weitere-infos'}));
                $courseNodeTemplate->setProperty('zertifikat', $this->linkText($version->zertifikat));
                $courseNodeTemplate->setProperty('keywords', $version->{'meta-keywords'});
                $courseNodeTemplate->setProperty('sort', sprintf('%09d', $kurs->reihenfolge).'___'.$version->titel);


                $courseNodeTemplate->setProperty(
                      'fulltext',
                      strtolower(
                        strip_tags(
                          $version->titel.' '.
                          $version->{'sub-titel'}.' '.
                          $this->linkText($version->ziel).' '.
                          $this->linkText($version->inhalt).' '.
                          $this->linkText($kurs->{'stufe-wb'}).' '.
                          $this->linkText($version->zielgruppe).' '.
                          $this->linkText($version->voraussetzungen).' '.
                          $this->linkText($version->methode).' '.
                          $this->linkText($version->kursunterlagen).' '.
                          $this->linkText($version->hinweis).' '.
                          $this->linkText($version->{'weitere-infos'}).' '.
                          $this->linkText($version->zertifikat).' '.
                          $version->{'meta-keywords'}
                        )
                      )
                   );


                // $this->emitCourseCreated($courseNode);




                $courseNode = $rootNode->createNodeFromTemplate($courseNodeTemplate);


                if (!empty($version->{'publikation-start'})) {
                    $date = \DateTime::createFromFormat('Y-m-d H:i', $version->{'publikation-start'}.' 00:00', new \DateTimeZone('Europe/Zurich'))->setTimezone(new \DateTimeZone('UTC'))  ;
                    $courseNode->setHiddenBeforeDateTime($date);
                }

                if (!empty($version->{'publikation-ende'})) {
                    $date = \DateTime::createFromFormat('Y-m-d H:i', $version->{'publikation-ende'}.' 23:59', new \DateTimeZone('Europe/Zurich'))->setTimezone(new \DateTimeZone('UTC'))  ;
                    $courseNode->setHiddenAfterDateTime($date);
                }


                $tagsMonth = [];
                $tagsDay = [];

                if (!empty($version->durchfuehrungen->durchfuehrung)) {
                    foreach ($version->durchfuehrungen->durchfuehrung as $durchfuehrung) {
                        $durchfuehrungNodeTemplate = new NodeTemplate();
                        $durchfuehrungNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseExecution'));

                        $durchfuehrungNodeTemplate->setProperty('code', $durchfuehrung->code);

                        $durchfuehrungNodeTemplate->setProperty('start', \DateTime::createFromFormat('Y-m-d', $durchfuehrung->start));
                        $durchfuehrungNodeTemplate->setProperty('end', \DateTime::createFromFormat('Y-m-d', $durchfuehrung->ende));


                        // only if anmerkung is empty the course is always on the same weekday
                        if (empty($durchfuehrung->anmerkung) && !empty($durchfuehrung->start)) {
                            $days = [
                      ['title'=>'Sonntag','sort'=>100,'type'=>'day'],
                      ['title'=>'Montag','sort'=>200,'type'=>'day'],
                      ['title'=>'Dienstag','sort'=>300,'type'=>'day'],
                      ['title'=>'Mittwoch','sort'=>400,'type'=>'day'],
                      ['title'=>'Donnerstag','sort'=>500,'type'=>'day'],
                      ['title'=>'Freitag','sort'=>600,'type'=>'day'],
                      ['title'=>'Samstag','sort'=>700,'type'=>'day']
                    ];

                            $months = [
                      ['title'=>'Januar','sort'=>100,'type'=>'month'],
                      ['title'=>'Februar','sort'=>200,'type'=>'month'],
                      ['title'=>'März','sort'=>300,'type'=>'month'],
                      ['title'=>'April','sort'=>400,'type'=>'month'],
                      ['title'=>'Mai','sort'=>500,'type'=>'month'],
                      ['title'=>'Juni','sort'=>600,'type'=>'month'],
                      ['title'=>'Juli','sort'=>700,'type'=>'month'],
                      ['title'=>'August','sort'=>800,'type'=>'month'],
                      ['title'=>'September','sort'=>900,'type'=>'month'],
                      ['title'=>'Oktober','sort'=>1000,'type'=>'month'],
                      ['title'=>'November','sort'=>1100,'type'=>'month'],
                      ['title'=>'Dezember','sort'=>1200,'type'=>'month']
                    ];

                            $tagsDay[] = $days[\DateTime::createFromFormat('Y-m-d', $durchfuehrung->start)->format('N')];
                            $tagsMonth[] = $months[\DateTime::createFromFormat('Y-m-d', $durchfuehrung->start)->format('n')-1];
                        }



                        // add Unicode Zero Width Space (U+200B) after slash
                        // $durchfuehrungNodeTemplate->setProperty('anmerkung', str_replace('/', "/\xE2\x80\x8C", $durchfuehrung->anmerkung));
                        $durchfuehrungNodeTemplate->setProperty('anmerkung', $this->linkText($durchfuehrung->anmerkung));

                        $durchfuehrungNodeTemplate->setProperty('terminausblenden', $durchfuehrung->{'termin-ausblenden'});

                        $durchfuehrungNodeTemplate->setProperty('priceZH', $durchfuehrung->kosten);
                        $durchfuehrungNodeTemplate->setProperty('priceNotZH', $durchfuehrung->{'kosten-extern'});
                        $durchfuehrungNodeTemplate->setProperty('priceSfGZ', $durchfuehrung->{'kosten-lernende'});

                        $durchfuehrungNodeTemplate->setProperty('maxTeilnehmer', $durchfuehrung->maxteilnehmer);
                        $durchfuehrungNodeTemplate->setProperty('anmeldeschluss', \DateTime::createFromFormat('Y-m-d', $durchfuehrung->anmeldeschluss));

                        $durchfuehrungNodeTemplate->setProperty('ecoMandant', $durchfuehrung->{'eco_mandant'});
                        $durchfuehrungNodeTemplate->setProperty('ecoAngebotId', $durchfuehrung->{'eco_angebot_id'});
                        $durchfuehrungNodeTemplate->setProperty('ecoFachId', $durchfuehrung->{'eco_fach_id'});
                        $durchfuehrungNodeTemplate->setProperty('status', $durchfuehrung->status);
                        $durchfuehrungNodeTemplate->setProperty('lektionen', (int)$durchfuehrung->lektionen);


                        $durchfuehrungNodeTemplate->setProperty('ort', $durchfuehrung->ort);
                        $durchfuehrungNodeTemplate->setProperty('teacher', $durchfuehrung->{'lehrperson-text'});
                        $durchfuehrungNodeTemplate->setProperty('von', $durchfuehrung->{'zeit-von'});
                        $durchfuehrungNodeTemplate->setProperty('bis', $durchfuehrung->{'zeit-bis'});
                        $durchfuehrungNodeTemplate->setProperty('veranstaltungen', (int)$durchfuehrung->veranstaltungen);


                        $durchfuehrungNode = $courseNode->getNode('executions')->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));

                        if (!empty($durchfuehrung->{'publikation-start'})) {
                            $date = \DateTime::createFromFormat('Y-m-d H:i', $durchfuehrung->{'publikation-start'}.' 00:00', new \DateTimeZone('Europe/Zurich'))->setTimezone(new \DateTimeZone('UTC'))  ;
                            $durchfuehrungNode->setHiddenBeforeDateTime($date);
                        }
                        if (!empty($durchfuehrung->{'publikation-ende'})) {
                            $date = \DateTime::createFromFormat('Y-m-d H:i', $durchfuehrung->{'publikation-ende'}.' 23:59', new \DateTimeZone('Europe/Zurich'))->setTimezone(new \DateTimeZone('UTC'))  ;
                            $durchfuehrungNode->setHiddenAfterDateTime($date);
                        }


                        $this->emitCourseCreated($durchfuehrungNode, $courseNode);
                    } // end $durchfuehrung
                }


                $tags = [];
                foreach ($kurs->kategorien->kategorie as $kategorie) {
                    $tags[] = ['title'=>strval($kategorie),'sort'=>(int)$kategorie["reihenfolge"],'type'=>'category-'.$categories[strval($kategorie)]];
                }

                $courseNode->setProperty('categories', $this->getTagNodes(array_merge($tags, $tagsMonth, $tagsDay), $rootNode));
            } // end version
        } // end kurs

      $this->persistenceManager->persistAll();

        return '<h3>Neuer Import abgeschlossen.</h3>';
    }


    public function importAction()
    {
        $msg = $this->deleteAllCourses();
        $msg .= $this->importCourse();

        $this->response->setStatus(201);
        return $msg; // 'Import all done. ';
    }


    public function enrollAction()
    {
        $path = dirname(getcwd())."/Packages/Sites/signalwerk.sfgz/Classes/signalwerk/sfgz/Controller";

        if (!empty($_POST["data"])) {
            $data = $_POST['data'];
        } else {
            $postData = file_get_contents($path ."/mail.json");
            $data = json_decode($postData)->data;
        }

        // To create the nested structure
        if (!file_exists($this->backupPath())) {
            if (!mkdir($this->backupPath(), 0777, true)) {
                die('Failed to create mail (save)...');
            }
        }
        file_put_contents($this->backupFilePath().'_data.json', json_encode($data, JSON_PRETTY_PRINT));

        // it can be --contact-form[agb  or --contact-form[agb]
        $pattern = '/--contact-form\[([^\]]*)(\])?$/';
        $dataObj = new stdClass;

        // format all --contact-form[agb] to => agb
        foreach ($data as $key => $value) {
            if (preg_match($pattern, $key, $matches, PREG_OFFSET_CAPTURE)) {
                $name = $matches[1][0];
                $dataObj->$name = $value;
            }
        }

        $query = new FlowQuery(array($this->context->getRootNode()));
        // $query = $query->find('[instanceof signalwerk.sfgz:Course][coursid = "' +  (string)$dataObj->coursid  +'"]');
        $queryCourse = $query->find(('[instanceof signalwerk.sfgz:Course][coursid = "' .  $dataObj->coursid  . '"]'))->get(0);
        $queryExecution = $query->find(('[instanceof signalwerk.sfgz:CourseExecution][code = "' .  $dataObj->executionid  . '"]'))->get(0);

        $dataObj->title = $queryCourse->getProperty('title');
        $dataObj->code = $queryExecution->getProperty('code');
        $dataObj->start = $queryExecution->getProperty('start')->format('d.m.Y');
        $dataObj->end = $queryExecution->getProperty('end')->format('d.m.Y');

        $dataObj->priceZH = $queryExecution->getProperty('priceZH');
        $dataObj->priceNotZH = $queryExecution->getProperty('priceNotZH');

        $dataObj->ecoMandant = $queryExecution->getProperty('ecoMandant');
        $dataObj->ecoAngebotId = $queryExecution->getProperty('ecoAngebotId');
        $dataObj->ecoFachId = $queryExecution->getProperty('ecoFachId');

        if (strtolower($dataObj->anrede) === 'herr') {
            $dataObj->isHerr = true;
        }

        $msg = $this->emailCourse($dataObj);
        $msg .= $this->exportCourse($dataObj);

        $this->response->setStatus(201);
        return $msg; // 'Import all done. ';
    }



    /**
     * Signal which informs about a newly created comment
     *
     * @param NodeInterface $commentNode The comment node
     * @param NodeInterface $postNode The post node
     * @return void
     * @Flow\Signal
     */
    protected function emitCourseCreated(NodeInterface $commentNode, NodeInterface $postNode)
    {
    }


    /**
     * Signal which informs about a newly created comment
     *
     * @param NodeInterface $categoryNode The comment node
     * @return void
     * @Flow\Signal
     */
    protected function emitCategoryCreated(NodeInterface $categoryNode)
    {
    }
}
