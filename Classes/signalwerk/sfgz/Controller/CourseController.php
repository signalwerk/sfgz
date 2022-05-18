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
use DateTime;
use Parsedown;


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
        $this->context = $this->contextFactory->create(array(
            'workspaceName' => 'live',
            'invisibleContentShown' => true,
            'inaccessableContentShown' => true,
        ));
        $this->logImportLast = new DateTime;
    }

    protected function dataPath()
    {
        return dirname(getcwd()) . "/Data/API/";
    }

    protected function backupPath()
    {
        return $this->dataPath() . "backup/" . date("Y") . "/" . date("m") . "/";
    }

    protected function backupFilePath()
    {
        return $this->backupPath() . date("Y-m-d") . "___" . date("H-i-s") . "___" . date("U");
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
        $this->log("Start – Delete", true);

        $msg = '';
        // ------------------------------------------------

        $this->log("  * find executions start", true);

        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:CourseExecution]');

        $this->log("  * find executions end");

        $msg .= '<p>Alte Durchführungen gelöschen: ' . count($query) . 'x</p>';

        $this->log("  * delete executions start", true);
        foreach ($query as $courseExecution) {
            $courseExecution->remove();
            $this->emitCourseDeleted($courseExecution);
        }
        $this->log("  * delete executions end");

        // ------------------------------------------------

        $this->log("  * find category start", true);

        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:CourseCategory]');
        $this->log("  * find category end");

        $msg .= '<p>Alte Kategorien gelöschen: ' . count($query) . 'x</p>';

        $this->log("  * delete category start", true);

        foreach ($query as $courseCategory) {
            $courseCategory->remove();
            $this->emitCourseDeleted($courseCategory);
        }
        $this->log("  * delete category end");

        // ------------------------------------------------


        $this->log("  * find course start", true);

        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:Course]');
        $this->log("  * find course end");

        $msg .= '<p>Alte Kurse gelöschen: ' . count($query) . 'x</p>';

        $this->log("  * delete course start", true);
        foreach ($query as $course) {
            $course->remove();
            $this->emitCourseDeleted($course);
        }

        $this->log("  * delete course end");

        $this->log("  * persist start", true);
        $this->persistenceManager->persistAll();
        $this->log("  * persist end");

        $this->log("End – Delete", true);

        return $msg;
    }


    protected function emailCourse($data)
    {
        $engine = new Handlebars;

        $path = dirname(getcwd()) . "/DistributionPackages/signalwerk.sfgz/Classes/signalwerk/sfgz/Controller";
        $templateMail = file_get_contents($path . "/mail.hbs") . file_get_contents($path . "/mail__facts.hbs");


        // generate mail text
        $mailtxt = $engine->render($templateMail, $data);

        // To create the nested structure
        if (!file_exists($this->backupPath())) {
            if (!mkdir($this->backupPath(), 0777, true)) {
                die('Failed to create mail (save)...');
            }
        }

        // save backup
        file_put_contents($this->backupFilePath() . '_mail.txt', $mailtxt);
        file_put_contents($this->backupFilePath() . '_mail.json', json_encode($data, JSON_PRETTY_PRINT));

        $mail = new PHPMailer;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom('smtpauth.informatik@sfgz.ch', 'SfGZ – Weiterbildung');
        $mail->addReplyTo('kurse@sfgz.ch');
        $mail->addAddress($data->{'E-Mail'});
        // $mail->addBCC('sh@signalwerk.ch');


        // Server settings
        // https://help.mba.zh.ch/index.php/intranet-sek-ii/mail-in2/einstellungen-in2
        $mail->isSMTP();                                            // Send using SMTP
        $mail->Host       = 'smtp.office365.com';                    // Set the SMTP server to send through
        $mail->Port       = 587;
        $mail->SMTPSecure = 'tls';
        $mail->SMTPAuth   = true;
        // $mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
        $mail->Username   = 'smtpauth.informatik@sfgz.ch';                     // SMTP username
        $mail->Password   = getenv("MAIL_PASSWORD");                               // SMTP password

        $mail->Subject = 'Ihre Anmeldung - ' . $data->title;
        $mail->Body = $mailtxt;

        //send the message, check for errors
        if (!$mail->send()) {
            $msg = "Mailer Error: " . $mail->ErrorInfo;
            file_put_contents($this->backupFilePath() . '_mail_error.txt', $msg);
        } else {
            $msg = "<h1>Danke für die Anmeldung!</h1>";
        }


        // mail an die Verwaltung

        $templateMail = file_get_contents($path . "/mail__facts.hbs");
        $mailtxt = $engine->render($templateMail, $data);

        $mailVerwaltung = new PHPMailer;
        $mailVerwaltung->CharSet = 'UTF-8';
        $mailVerwaltung->setFrom('smtpauth.informatik@sfgz.ch', 'SfGZ – Weiterbildung');
        $mailVerwaltung->addReplyTo('kurse@sfgz.ch');
        $mailVerwaltung->addAddress('anmeldungen@sfgz.ch');
        // $mailVerwaltung->addBCC('sh@signalwerk.ch');

        // Server settings
        // https://help.mba.zh.ch/index.php/intranet-sek-ii/mail-in2/einstellungen-in2
        $mailVerwaltung->isSMTP();                                            // Send using SMTP
        $mailVerwaltung->Host       = 'smtp.office365.com';                    // Set the SMTP server to send through
        $mailVerwaltung->Port       = 587;
        $mailVerwaltung->SMTPSecure = 'tls';
        $mailVerwaltung->SMTPAuth   = true;
        // $mailVerwaltung->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
        $mailVerwaltung->Username   = 'smtpauth.informatik@sfgz.ch';                     // SMTP username
        $mailVerwaltung->Password   = getenv("MAIL_PASSWORD");                               // SMTP password


        $mailVerwaltung->Subject = 'Kursanmeldung - ' . $data->Vorname . ' ' . $data->Name . ', ' . $data->Ort;
        $mailVerwaltung->Body = $mailtxt;

        //send the message, check for errors
        if (!$mailVerwaltung->send()) {
            $msg .= "Mailer Error: " . $mailVerwaltung->ErrorInfo;
            file_put_contents($this->backupFilePath() . '_mailVerwaltung_error.txt', $msg);
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
        $anmeldung->appendChild($domtree->createElement('Strasse', $data->Strasse . " " . $data->StrasseNr));
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
        $anmeldung->appendChild($domtree->createElement('AgName2', $data->bill_anrede . " " . $data->bill_Vorname . " " . $data->bill_Name));
        $anmeldung->appendChild($domtree->createElement('AgStrasse', $data->bill_Strasse . " " . $data->bill_StrasseNr));
        $anmeldung->appendChild($domtree->createElement('AgStrName', $data->bill_Strasse));
        $anmeldung->appendChild($domtree->createElement('AgStrNr', $data->bill_StrasseNr));
        $anmeldung->appendChild($domtree->createElement('AgPLZ', $data->bill_Postleitzahl));
        $anmeldung->appendChild($domtree->createElement('AgOrt', $data->bill_Ort));
        // $anmeldung->appendChild($domtree->createElement('Bemerkung', $data->Comment ));

        // save local copy
        $domtree->save($this->backupFilePath() . '_export.xml');

        // save for export
        $exportPath = $this->dataPath() . "export/ecoopen/";
        // To create the nested structure
        if (!file_exists($exportPath)) {
            if (!mkdir($exportPath, 0777, true)) {
                die('Failed to create xml (save)...');
            }
        }
        // write export
        $domtree->save($exportPath . "MBA_ZH_53_" . date("U") . '.xml');

        return " xml written. ";
        // file_put_contents($this->backupFilePath().'_mail.json', json_encode($data, JSON_PRETTY_PRINT));
    }

    // remove text references with the link
    protected function linkText($text)
    {
        return str_replace('#REP_URL#', './detail.html?kurs=', $text);
    }


    /**
     * @var array
     */
    protected $logImport = array();

    protected $logImportLast;

    protected function pluralize($count, $text)
    {
        return $count . (($count == 1) ? (" $text") : (" ${text}s"));
    }
    protected function ago($datetime)
    {
        $interval = date_create('now')->diff($datetime);
        $suffix = ($interval->invert ? ' ago' : '');
        if ($v = $interval->y >= 1) {
            return $this->pluralize($interval->y, 'year') . $suffix;
        }
        if ($v = $interval->m >= 1) {
            return $this->pluralize($interval->m, 'month') . $suffix;
        }
        if ($v = $interval->d >= 1) {
            return $this->pluralize($interval->d, 'day') . $suffix;
        }
        if ($v = $interval->h >= 1) {
            return $this->pluralize($interval->h, 'hour') . $suffix;
        }
        if ($v = $interval->i >= 1) {
            return $this->pluralize($interval->i, 'minute') . $suffix;
        }
        return $this->pluralize($interval->s, 'second') . $suffix;
    }

    protected function log($text, $noDuration = false)
    {
        $time = date("Y-m-d | H:i:s");
        $duration = $this->ago($this->logImportLast);
        if ($noDuration) {
            $total = $time . " | " . $text;
        } else {
            $total = $time . " | " . $duration . " | " . $text;
        }

        array_push($this->logImport, $total);
        $this->logImportLast = new DateTime();
    }

    protected function importCourse()
    {
        // $this->dlCourseXML();

        $rootNode = $this->getRootOfImport();

        if ($rootNode === null) {
            return 'Expected course root not found! [uriPathSegment="course"]';
        }


        function parseText( $str ) {
            return iconv( "Windows-1252", "UTF-8", $str );
        }

        function parseMD( $str ) {
            $Parsedown = new Parsedown();
            $txt = preg_replace("/^•([\t])+/im", "* ", $str);
            return $Parsedown->text($txt);
        }


        function parseManualDate( $str ) {
            $original_date = $str;
            $date_part = explode('.', $original_date);
        
            if((int)$date_part[2] < 2000) {
                $date_part[2] = "20" . $date_part[2];
            }

            $date_part=array_map('trim',$date_part);

            return  parseDate('d.m.Y H:i', implode(".", $date_part)  . ' 00:00');
        }

        function parseDate( $format, $str ) {
            return \DateTime::createFromFormat($format, $str, new \DateTimeZone('Europe/Zurich'))/*->setTimezone(new \DateTimeZone('UTC'))*/;
        }

        $handle = fopen($this->dataPath() . 'import/ecoopen/WB_Kurse.csv','r');
        $assocData = array();
        if ($handle) {
            $headerRecord = array();
            $rowCounter = 0;
            while (($rowData = fgetcsv($handle, 0, ";")) !== FALSE) {
                if( 0 === $rowCounter) {
                    $headerRecord = $rowData;
                } else {
                    $assocData[ $rowCounter - 1] = array();

                    foreach( $rowData as $key => $value) {
                        $assocData[ $rowCounter - 1][ $headerRecord[ $key] ] = parseText($value);  
                    }
                }
                $rowCounter++;

            }
            fclose($handle);
        }


        // print '<pre>';
        // print_r($assocData);
        // print '</pre>';


        $courses = array();
        $tags = array();


        $buildingToStreet = array(
            "lp" => "Ausstellungsstrasse 104, CH-8005 Zürich",
            "ba" => "Ausstellungsstrasse 100, CH-8005 Zürich",
            "fi" => "Ausstellungsstrasse 90, CH-8005 Zürich",
            "jo" => "Josefstrasse 53, 6. Stock, CH-8005 Zürich",
            "extern" => "extern",
        );
        
        foreach ($assocData as $kurs) {
            
            // combine to one course based on Kurs_Code
            $CourseID = trim($kurs["Kurs_Code"]);
            if(empty($courses[$CourseID])) {


                $importCourse = array(
                    "type" => array("value" => $kurs["Mandant_Id"] === "38" ? "apprentice" : "course", "index" => false), 
                    "coursid" => array("value" => trim($kurs["Kurs_Code"]), "index" => false), 

                    "status" => array("value" => trim($kurs["Text_Buchungsstatus"]), "index" => false), 
                    
                    "title" => array("value" => $kurs["Kurs_Titel"], "index" => true),
                    "subtitle" => array("value" => $kurs["Kurs_Beschreibung"], "index" => true),
                    "ziel" => array("value" => parseMD($kurs["Text_Kursbeschreibung"]), "index" => true),
                    "inhalt" => array("value" => parseMD($kurs["Text_Inhalt_Schwerpunkte"]), "index" => true),
                    "stufe" => array("value" => parseMD($kurs["Text_Anspruchsniveau"]), "index" => true),
                    "zielgruppe" => array("value" => parseMD($kurs["Text_Zielgruppe"]), "index" => true),
                    "voraussetzungen" => array("value" => parseMD($kurs["Text_Voraussetzungen"]), "index" => true),
                    "methode" => array("value" => parseMD($kurs["Text_Arbeitsweise"]), "index" => true),
                    "kursmittel" => array("value" => parseMD($kurs["Text_Unterlagen"]), "index" => true),
                    "hinweis" => array("value" => parseMD($kurs["Text_Hinweis_Bemerkungen"]), "index" => true),
                    // "weitereinfos" => array("value" => parseMD($kurs["xxxxx"]), "index" => true), // not used anymore?
                    "zertifikat" => array("value" => parseMD($kurs["Text_Abschluss"]), "index" => true),
                    // "keywords" => array("value" => $kurs["xxxxx"], "index" => true), // not used anymore?
                    "sort" => array("value" => $kurs["Kurs_Titel"], "index" => false),
                );

                $currentTags = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', trim($kurs["Text_Rubrik"]))));
                foreach ($currentTags as $tag) {
                    if(empty($tags[$tag])) {
                        $tags[$tag] = array("title" => $tag, "node" => null);
                    }
                }

                $courses[$CourseID] = array("course" => $importCourse, "executions" => array(), "tags" => $currentTags, "hiddenBeforeDateTime" => null, "hiddenAfterDateTime" => null);
            }
            

            // handle executions
            $ExecutionID = $kurs["Angebot_Id"];
            if(empty($courses[$CourseID]['executions'][$ExecutionID])) {

                $hiddenBeforeDateTime =  parseManualDate($kurs["Publikation_Beginn"]);
                
                // set visibility of course
                if ($courses[$CourseID]["hiddenBeforeDateTime"] === null || $courses[$CourseID]["hiddenBeforeDateTime"] > $hiddenBeforeDateTime) {
                    $courses[$CourseID]["hiddenBeforeDateTime"] = $hiddenBeforeDateTime;
                }

                $hiddenAfterDateTime = parseManualDate($kurs["Publikation_Ende"]);
                
                // set visibility of course
                if ($courses[$CourseID]["hiddenAfterDateTime"] === null || $courses[$CourseID]["hiddenAfterDateTime"] < $hiddenAfterDateTime) {
                    $courses[$CourseID]["hiddenAfterDateTime"] = $hiddenAfterDateTime;
                }
                

                $dateFormat = 'Y-m-d H:i:s';
                // $dateFormat = 'd.m.Y H:i';

                $start = parseDate($dateFormat, $kurs["Angebot_Beginn"]);
                $anmeldeschluss = $kurs["Anmeldeschluss"] ? parseDate($dateFormat, $kurs["Anmeldeschluss"]) : null;


                $teacher = $kurs["Text_Mehrere_Kursleiter"] ?: ($kurs["Lehrer_Vorname"] . " " . $kurs["Lehrer_Name"]);
                $importExecution = array(
                    "code" => trim($kurs["Kurs_Code"] . " " . $kurs["Zusatz1"]),

                    "ecoAngebotId" => $kurs["Angebot_Id"],
                    "ecoFachId" => $kurs["Fach_Id"],

                    "start" => $start,
                    "end" => parseDate($dateFormat, $kurs["Angebot_Ende"]),

                    // add Unicode Zero Width Space (U+200B) after slash
                    // https://unicode-table.com/en/200B/
                    "anmerkung" => str_replace('/', "/\xE2\x80\x8B", $kurs["Text_Daten"]), 

                    "ort" => $kurs["Gebaeude"] ? $buildingToStreet[strtolower($kurs["Gebaeude"])] : "", 

                    "priceZH" => (int)$kurs["Kurskosten"], 
                    "priceNotZH" => (int)$kurs["Kurskosten_AK_Kurse"], 
                    "priceSfGZ" => (int)$kurs["Kurskosten_Lernende"], 

                    "maxTeilnehmer" => (int)$kurs["Max_Teilnehmer"], 
                    "anmeldeschluss" => $anmeldeschluss,
                    "lektionen" => (int)$kurs["Anzahl Wochenlektionen"], 
                    "veranstaltungen" => (int)$kurs["Anzahl_Veranstaltungen"], 
                    "von" => $kurs["Zeit_von"], 
                    "bis" => $kurs["Zeit_bis"], 

                    "teacher" => $teacher,
                );

                $courses[$CourseID]['executions'][$ExecutionID] = array("execution" => $importExecution, "teachers" => [$teacher], "hiddenBeforeDateTime" => $hiddenBeforeDateTime, "hiddenAfterDateTime" => $hiddenAfterDateTime);
            } else {
                // if we have multiple teachers there are multiple lines
                // all the rest is the same
                if(empty($kurs["Text_Mehrere_Kursleiter"])) {
                    $teacher = $kurs["Lehrer_Vorname"] . " " . $kurs["Lehrer_Name"];
                    $courses[$CourseID]['executions'][$ExecutionID]['teachers'][] = $teacher;
                    $courses[$CourseID]['executions'][$ExecutionID]['execution']["teacher"] = implode(", ", $courses[$CourseID]['executions'][$ExecutionID]['teachers']);
                } else {
                    $courses[$CourseID]['executions'][$ExecutionID]['execution']['teacher'] = $kurs["Text_Mehrere_Kursleiter"];
                }
            }
        }

        // print '<pre>';
        // print_r($courses);
        // print '</pre>';


        foreach ($tags as $key => $tag) {
            $tagNodeTemplate = new NodeTemplate();
            $tagNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseCategory'));
            $tagNodeTemplate->setProperty('title', $tag['title']);
            $tags[$key]['node'] = $rootNode->createNodeFromTemplate($tagNodeTemplate);
        }
  
        $this->persistenceManager->persistAll();

        foreach ($courses as $course) {
            $this->log("Start – Import: " . $course["course"]["coursid"]["value"], true);

           
                $courseNodeTemplate = new NodeTemplate();
                $courseNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:Course'));

                $fulltext = array();
                foreach ($course["course"] as $key => $value) {
                    $courseNodeTemplate->setProperty($key, $value["value"]);
                    if($value["index"]) {
                        $fulltext[] = $value["value"];
                    }
                }

                $courseNodeTemplate->setProperty('fulltext', 
                    strtolower(
                        strip_tags(
                            implode(" ", $fulltext)
                        )
                    )
                );

                $currentTags = array_map(function ($tag) use ($tags) {
                    return $tags[$tag]["node"];
                }, $course["tags"]);

                $courseNodeTemplate->setProperty('categories', $currentTags);

                $courseNode = $rootNode->createNodeFromTemplate($courseNodeTemplate);
                // $courseNode->setHiddenBeforeDateTime($course["hiddenBeforeDateTime"]);
                // $courseNode->setHiddenAfterDateTime($course["hiddenAfterDateTime"]);

                $startDate = null;
                if (!empty($course["course"]["Publikation_Beginn"])) {
                    $startDate = parseDate('d.m.y H:i', $course["course"]["Publikation_Beginn"] . ' 00:00');
                }

                $dateEnd = null;
                if (!empty($course["course"]["Publikation_Ende"])) {
                    $dateEnd = parseDate('d.m.y H:i', $course["course"]["Publikation_Ende"] . ' 23:59');
                }

                foreach ($course["executions"] as $execution) {

                    $durchfuehrungNodeTemplate = new NodeTemplate();
                    $durchfuehrungNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('signalwerk.sfgz:CourseExecution'));

                    foreach ($execution["execution"] as $key => $value) {
                        $durchfuehrungNodeTemplate->setProperty($key, $value);
                    }

                    $durchfuehrungNode = $courseNode->getNode('executions')->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));

                    // $durchfuehrungNode->setHiddenBeforeDateTime($execution["hiddenBeforeDateTime"]);
                    // $durchfuehrungNode->setHiddenAfterDateTime($execution["hiddenAfterDateTime"]);
                }

            $this->log("End – Import: " . $course["course"]["coursid"]["value"], true);

        }


        $this->log("Start – persist", true);
        $this->persistenceManager->persistAll();
        $this->log("End – persist");
        
        return '<h3>Neuer Import abgeschlossen.</h3>';
    }


    public function importAction()
    {
        $this->log("Start – import", true);

        $msg = $this->deleteAllCourses();
        $msg .= $this->importCourse();

        $this->response->setStatus(201);
        $this->log("End – import", true);
        return $msg . "<pre style='font-size: 0.9em;'>\n" . join("\n", $this->logImport) . "\n</pre>"; // 'Import all done. ';
    }


    public function enrollAction()
    {
        $path = dirname(getcwd()) . "/DistributionPackages/signalwerk.sfgz/Classes/signalwerk/sfgz/Controller";

        if (!empty($_POST["data"])) {
            $data = $_POST['data'];
        } else {
            $postData = file_get_contents($path . "/mail.json");
            $data = json_decode($postData)->data;
        }

        // To create the nested structure
        if (!file_exists($this->backupPath())) {
            if (!mkdir($this->backupPath(), 0777, true)) {
                die('Failed to create mail (save)...');
            }
        }
        file_put_contents($this->backupFilePath() . '_data.json', json_encode($data, JSON_PRETTY_PRINT));

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
