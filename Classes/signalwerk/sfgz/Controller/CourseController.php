<?php
//  ./flow flow:package:rescan

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
 * Courses controller for the Blog package
 */
class CourseController extends ActionController
{

    // /**
    //  * @Flow\Inject
    //  * @var \signalwerk\sfgz\Domain\Repository\CourseRepository
    //  */
    // protected $courseRepository;

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
     * Initialize the Akismet service
     *
     * @return void
     */
    protected function initializeAction()
    {
        // $this->akismetService->setCurrentRequest($this->request->getHttpRequest());
    }

    protected function init() {
      $this->context = $this->contextFactory->create(array('workspaceName' => 'live'));
    }

   protected function dataPath() {
     return dirname(getcwd())."/Data/API/";
   }

    protected function backupPath() {
       return $this->dataPath()."backup/".date("Y")."/".date("m")."/";
    }

    protected function backupFilePath() {
       return $this->backupPath().date("Y-m-d")."___".date("H-i-s")."___".date("U");
    }


    protected function getRootOfImport() {
      $this->init();

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
    protected function deleteAllCourses() {

        $msg = '';
        $this->init();

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
      $mailtxt = $engine->render( $templateMail, $data );

      // To create the nested structure
      if (!file_exists($this->backupPath())) {
        if (!mkdir($this->backupPath(), 0777, true)) {
            die('Failed to create mail (save)...');
        }
      }

      // save backup
      file_put_contents($this->backupFilePath().'_mail.txt', $mailtxt );
      file_put_contents($this->backupFilePath().'_mail.json', json_encode($data, JSON_PRETTY_PRINT));

      $mail = new PHPMailer;
      $mail->CharSet = 'UTF-8';
      $mail->setFrom('weiterbildung@medienformfarbe.ch', 'SfGZ – Weiterbildung');
      $mail->addAddress($data->{'E-Mail'});
      $mail->addBCC('sh@signalwerk.ch');

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
      $mailtxt = $engine->render( $templateMail, $data );

      $mailVerwaltung = new PHPMailer;
      $mailVerwaltung->CharSet = 'UTF-8';
      $mailVerwaltung->setFrom('weiterbildung@medienformfarbe.ch', 'SfGZ – Weiterbildung');
      $mailVerwaltung->addAddress('weiterbildung@medienformfarbe.zh.ch');
      $mailVerwaltung->addBCC('sh@signalwerk.ch');

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
      $anmeldung->appendChild($domtree->createElement('KursID', $data->ecoAngebotId ));
      $anmeldung->appendChild($domtree->createElement('KlassenID', $data->ecoFachId ));
      $anmeldung->appendChild($domtree->createElement('Anrede', $data->anrede ));
      $anmeldung->appendChild($domtree->createElement('Name', $data->Name ));
      $anmeldung->appendChild($domtree->createElement('Vorname', $data->Vorname ));
      $anmeldung->appendChild($domtree->createElement('Strasse', $data->Strasse." ".$data->StrasseNr ));
      $anmeldung->appendChild($domtree->createElement('StrName', $data->Strasse ));
      $anmeldung->appendChild($domtree->createElement('StrNr', $data->StrasseNr ));
      $anmeldung->appendChild($domtree->createElement('PLZ', $data->Postleitzahl ));
      $anmeldung->appendChild($domtree->createElement('Ort', $data->Ort ));
      $anmeldung->appendChild($domtree->createElement('TelefonP', $data->TelP ));
      $anmeldung->appendChild($domtree->createElement('TelefonG', $data->TelG ));
      $anmeldung->appendChild($domtree->createElement('Mobile', $data->TelM ));
      $anmeldung->appendChild($domtree->createElement('Email', $data->{'E-Mail'} ));
      $anmeldung->appendChild($domtree->createElement('Geburtsdatum', $data->Geburtsdatum ));
      $anmeldung->appendChild($domtree->createElement('AgName1', $data->bill_company ));
      $anmeldung->appendChild($domtree->createElement('AgName2', $data->bill_anrede." ".$data->bill_Vorname." ".$data->bill_Name ));
      $anmeldung->appendChild($domtree->createElement('AgStrasse', $data->bill_Strasse." ".$data->bill_StrasseNr ));
      $anmeldung->appendChild($domtree->createElement('AgStrName', $data->bill_Strasse ));
      $anmeldung->appendChild($domtree->createElement('AgStrNr', $data->bill_StrasseNr ));
      $anmeldung->appendChild($domtree->createElement('AgPLZ', $data->bill_Postleitzahl ));
      $anmeldung->appendChild($domtree->createElement('AgOrt', $data->bill_Ort ));
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
      $url = "http://intern.sfgz.ch/wbkurscms/getxml.aspx"; // Source file
      $fp = fopen($this->dataPath().'getxml.xml', "w"); // Destination location
      curl_setopt_array( $ci, array(
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
            $md5Tag=md5("$tag");
            $title = "$tag";
            if (!isset($this->tagNodes[$md5Tag])) {

               $tagNodeType = $this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseCategory');
               $name = Utility::renderValidNodeName($title);
              //  $name = uniqid('node');
               $tagNode = $rootNode->createNode($name, $tagNodeType);
               $tagNode->setProperty('title', $title);
               $this->tagNodes[$md5Tag] = $tagNode;
            }
            $tagNodes[] = $this->tagNodes[$md5Tag];
        }

        // echo "  --- count: ".count($tagNodes);
        // echo "  --- name: ".$tagNodes[0]->getIdentifier();

        return $tagNodes;
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

      // foreach([$xml->kurse->kurs[0]] as $kurs)
      foreach($xml->kurse->kurs as $kurs)
      {
          foreach($kurs->versionen->version as $version)
          {
            if (!empty($version->durchfuehrungen->durchfuehrung)) {

              $courseNodeTemplate = new NodeTemplate();
              $courseNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:Course'));

              $courseNodeTemplate->setProperty('coursid', $kurs->{'kurs-code'});
              $courseNodeTemplate->setProperty('title', $version->titel);
              $courseNodeTemplate->setProperty('subtitle', $version->{'sub-titel'});

              $courseNodeTemplate->setProperty('ziel', $version->ziel);
              $courseNodeTemplate->setProperty('inhalt', $version->inhalt);
              $courseNodeTemplate->setProperty('stufe', $kurs->{'stufe-wb'});
              $courseNodeTemplate->setProperty('zielgruppe', $version->zielgruppe);
              $courseNodeTemplate->setProperty('voraussetzungen', $version->voraussetzungen);
              $courseNodeTemplate->setProperty('methode', $version->methode);
              $courseNodeTemplate->setProperty('kursmittel', $version->kursunterlagen);
              $courseNodeTemplate->setProperty('hinweis', $version->hinweis);
              $courseNodeTemplate->setProperty('weitereinfos', $version->{'weitere-infos'});
              $courseNodeTemplate->setProperty('zertifikat', $version->zertifikat);

              // $this->emitCourseCreated($courseNode);



              $tags = [];
              foreach($kurs->kategorien->kategorie as $kategorie)
              {
                $tags[] = $kategorie;
              }


              $courseNodeTemplate->setProperty('categories', $this->getTagNodes($tags, $rootNode));

              $courseNode = $rootNode->createNodeFromTemplate($courseNodeTemplate);


              foreach($version->durchfuehrungen->durchfuehrung as $durchfuehrung)
              {

                $durchfuehrungNodeTemplate = new NodeTemplate();
                $durchfuehrungNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseExecution'));

                $durchfuehrungNodeTemplate->setProperty('code', $durchfuehrung->code);

                $start = $durchfuehrung->start;
                $end = $durchfuehrung->ende;
                $durchfuehrungNodeTemplate->setProperty('start', \DateTime::createFromFormat('Y-m-d', $start));
                $durchfuehrungNodeTemplate->setProperty('end', \DateTime::createFromFormat('Y-m-d', $end));

                // add Unicode Zero Width Space (U+200B) after slash
                $durchfuehrungNodeTemplate->setProperty('anmerkung', str_replace('/', "/\xE2\x80\x8C", $durchfuehrung->anmerkung));

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

                if (!empty($durchfuehrung->termine->termin)) {
                  $durchfuehrungNodeTemplate->setProperty('ort', $durchfuehrung->termine->termin[0]->ort);
                  $durchfuehrungNodeTemplate->setProperty('teacher', $durchfuehrung->termine->termin[0]->{'lehrperson-text'});
                  $durchfuehrungNodeTemplate->setProperty('von', $durchfuehrung->termine->termin[0]->{'zeit-von'});
                  $durchfuehrungNodeTemplate->setProperty('bis', $durchfuehrung->termine->termin[0]->{'zeit-bis'});
                  $durchfuehrungNodeTemplate->setProperty('veranstaltungen', (int)$durchfuehrung->termine->termin[0]->veranstaltungen);
                }

                $durchfuehrungNode = $courseNode->getNode('executions')->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));
                // $durchfuehrungNode = $courseNode->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));

                $this->emitCourseCreated($durchfuehrungNode, $courseNode);

              } // end $durchfuehrung
            }
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
          if (preg_match($pattern,$key,$matches,PREG_OFFSET_CAPTURE)) {
            $name = $matches[1][0];
            $dataObj->$name = $value;
            }
        }

        $this->init();
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

        if(strtolower($dataObj->anrede) === 'herr') {
          $dataObj->isHerr = true;
        }

      $msg = $this->emailCourse($dataObj);
      $msg .= $this->exportCourse($dataObj);

      $this->response->setStatus(201);
      return $msg; // 'Import all done. ';
    }







    /**
     * Creates a new comment
     *
     * @param NodeInterface $postNode The post node which will contain the new comment
     * @param NodeTemplate<RobertLemke.Plugin.Blog:Course> $newCourse
     * @return string
     */
    public function createAction(NodeInterface $postNode, NodeTemplate $newCourse)
    {
        # Workaround until we can validate node templates properly:
        if (strlen($newCourse->getProperty('author')) < 2) {
            $this->throwStatus(400, 'Your comment was NOT created - please specify your name.');
        }
        if (filter_var($newCourse->getProperty('emailAddress'), FILTER_VALIDATE_EMAIL) === false) {
            $this->throwStatus(400, 'Your comment was NOT created - you must specify a valid email address.');
        }
        if (strlen($newCourse->getProperty('text')) < 5) {
            $this->throwStatus(400, 'Your comment was NOT created - it was too short.');
        }
        $newCourse->setProperty('text', filter_var($newCourse->getProperty('text'), FILTER_SANITIZE_STRIPPED));
        $newCourse->setProperty('author', filter_var($newCourse->getProperty('author'), FILTER_SANITIZE_STRIPPED));
        $newCourse->setProperty('emailAddress', filter_var($newCourse->getProperty('emailAddress'), FILTER_SANITIZE_STRIPPED));
        $commentNode = $postNode->getNode('comments')->createNodeFromTemplate($newCourse, uniqid('comment-'));
        $commentNode->setProperty('spam', false);
        $commentNode->setProperty('datePublished', new \DateTime());
        if ($this->akismetService->isCourseSpam('', $commentNode->getProperty('text'), 'comment', $commentNode->getProperty('author'), $commentNode->getProperty('emailAddress'))) {
            $commentNode->setProperty('spam', true);
        }
        $this->emitCourseCreated($commentNode, $postNode);
        $this->response->setStatus(201);
        return 'Thank you for your comment!';
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