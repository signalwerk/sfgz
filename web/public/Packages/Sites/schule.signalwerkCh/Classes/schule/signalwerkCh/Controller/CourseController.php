<?php
//  ./flow flow:package:rescan

namespace schule\signalwerkCh\Controller;


use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeTemplate;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Domain\Service\Context;

/**
 * Courses controller for the Blog package
 */
class CourseController extends ActionController
{

    // /**
    //  * @Flow\Inject
    //  * @var \schule\signalwerkCh\Domain\Repository\CourseRepository
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
  		// $this->connection = $this->entityManager->getConnection();

  	}

    protected function getRootOfImport() {
      $this->init();

      // $this->contextFactory = $this->objectManager->get(ContextFactoryInterface::class);
      // $this->context = $this->contextFactory->create(array('workspaceName' => 'live'));

      // $rootNode = $this->context->getRootNode();
      // $siteNode = $context->getNode(‘/sites’)->getPrimaryChildNode();
      // $rootCourse = $this->context->getNode('/sites');

    	$q = new FlowQuery(array($this->context->getRootNode()));
    	// return $q->find('[instanceof Sfi.Kateheo:Category]')->filter('[originalIdentifier = "' . $id  .'"]')->get(0);
      // $mainCollectionNode = $newsNode->getNode('main');

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
    //  protected function deleteAction($email) {
    protected function deleteAllCourses() {

        $msg = '';
        $this->init();



        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof schule.signalwerkCh:CourseExecution]');

        $msg .= 'CourseExecution deleted: ' . count($query);

        foreach ($query as $courseExecution) {
          $courseExecution->remove();
          $this->emitCourseDeleted($courseExecution);
        }


        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof schule.signalwerkCh:Course]');

        $msg .= 'Course deleted: ' . count($query);

        foreach ($query as $course) {
          $course->remove();
          $this->emitCourseDeleted($course);
        }


        $this->persistenceManager->persistAll();


        // while ($result = $results->current()) {
        //     $result->setDeleted(1);
        //     $result->remove();
        //     $this->courseRepository->update($result);
        //     $results->next();
        // }

        //
        //
        //
        //
        // $classname = '\schule\signalwerkCh\Domain\Model\Course';
        // $query = $this->persistenceManager->createQueryForType($classname);
        // // $results = $query->matching($query->equals('coursid', '2788'))->execute();
        // $results = $query->setLimit( 2000 )->execute();
        // $count = count($results);
        //
        // while ($result = $results->current()) {
        //     $result->setDeleted(1);
        //     $result->remove();
        //     $this->courseRepository->update($result);
        //     $results->next();
        // }

        return $msg;

        // if ($count==0) {
        //     $this->redirect('unsubscribe');
        // } else {
        //     while ($result = $results->current()) {
        //         $result->setDeleted('1');
        //         $this->recipientRepository->update($result);
        //         $results->next();
        //     }
        //     $this->view->assign('error', '1');
        // }
        // $this->redirect('unsubscribe');
    }






    // public function importContact()
    // {
    //   $rootNode = $this->getRootOfImport();
    //
    //   if ($rootNode === null) {
    //       return 'Expected course root not found! [uriPathSegment="kurse"]';
    //   }
    //
    //   $path = dirname(getcwd())."/Packages/Sites/schule.signalwerkCh/Classes/schule/signalwerkCh/Controller";
    //   $jsonString = file_get_contents($path ."/mail.json");
    //
    //   $arr = json_decode($jsonString);
    //
    //   foreach($arr as $item) { //foreach element in $arr
    //
    //       $categoryNodeTemplate = new NodeTemplate();
    //       $categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('schule.signalwerkCh:ContactItem'));
    //       $categoryNodeTemplate->setProperty('title', $item->vorname.' '.$item->name);
    //       $categoryNodeTemplate->setProperty('firstname', $item->vorname);
    //       $categoryNodeTemplate->setProperty('familyname', $item->name);
    //       $categoryNodeTemplate->setProperty('email', $item->mail);
    //       $categoryNode = $rootNode->createNodeFromTemplate($categoryNodeTemplate);
    //       $this->persistenceManager->persistAll();
    //   }
    // }


    protected function importCourse()
    {
      $rootNode = $this->getRootOfImport();

      if ($rootNode === null) {
          return 'Expected course root not found! [uriPathSegment="course"]';
      }



      $path = dirname(getcwd())."/Packages/Sites/schule.signalwerkCh/Classes/schule/signalwerkCh/Controller";
      $xmlString = file_get_contents($path ."/getxml.xml");


      $xml = simplexml_load_string($xmlString);

      // foreach([$xml->kurse->kurs[0]] as $kurs)
      foreach($xml->kurse->kurs as $kurs)
      {
          foreach($kurs->versionen->version as $version)
          {
            if (!empty($version->durchfuehrungen->durchfuehrung)) {

              $categoryNodeTemplate = new NodeTemplate();
              $categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('schule.signalwerkCh:Course'));

              $categoryNodeTemplate->setProperty('coursid', $kurs->{'kurs-code'});
              $categoryNodeTemplate->setProperty('title', $version->titel);
              $categoryNodeTemplate->setProperty('subtitle', $version->{'sub-titel'});

              $categoryNodeTemplate->setProperty('ziel', $version->ziel);
              $categoryNodeTemplate->setProperty('inhalt', $version->inhalt);
              $categoryNodeTemplate->setProperty('stufe', $kurs->{'stufe-wb'});
              $categoryNodeTemplate->setProperty('zielgruppe', $version->zielgruppe);
              $categoryNodeTemplate->setProperty('voraussetzungen', $version->voraussetzungen);
              $categoryNodeTemplate->setProperty('methode', $version->methode);
              $categoryNodeTemplate->setProperty('kursmittel', $version->kursunterlagen);
              $categoryNodeTemplate->setProperty('hinweis', $version->hinweis);
              $categoryNodeTemplate->setProperty('zertifikat', $version->zertifikat);

              $categoryNode = $rootNode->createNodeFromTemplate($categoryNodeTemplate);
              // $this->emitCourseCreated($categoryNode);

              foreach($version->durchfuehrungen->durchfuehrung as $durchfuehrung)
              {


                $durchfuehrungNodeTemplate = new NodeTemplate();
                $durchfuehrungNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('schule.signalwerkCh:CourseExecution'));

                $durchfuehrungNodeTemplate->setProperty('code', $durchfuehrung->code);

                $start = $durchfuehrung->start;
                $end = $durchfuehrung->ende;
                $durchfuehrungNodeTemplate->setProperty('start', \DateTime::createFromFormat('Y-m-d', $start));
                $durchfuehrungNodeTemplate->setProperty('end', \DateTime::createFromFormat('Y-m-d', $end));

                $durchfuehrungNodeTemplate->setProperty('duration', $durchfuehrung->anmerkung);

                if (!empty($durchfuehrung->termine->termin)) {
                  $durchfuehrungNodeTemplate->setProperty('teacher', $durchfuehrung->termine->termin[0]->{'lehrperson-text'});
                }

                $durchfuehrungNodeTemplate->setProperty('priceZH', $durchfuehrung->kosten);
                $durchfuehrungNodeTemplate->setProperty('priceNotZH', $durchfuehrung->{'kosten-extern'});
                $durchfuehrungNodeTemplate->setProperty('priceSfGZ', $durchfuehrung->{'kosten-lernende'});

                // todo!!!
                // $durchfuehrungNodeTemplate->setProperty('maxTeilnehmer', $durchfuehrung->kosten);
                // $durchfuehrungNodeTemplate->setProperty('anmeldeschluss', $durchfuehrung->kosten);
                // $durchfuehrungNodeTemplate->setProperty('ort', $durchfuehrung->kosten);

                $durchfuehrungNodeTemplate->setProperty('ecoMandant', $durchfuehrung->{'eco_mandant'});
                $durchfuehrungNodeTemplate->setProperty('ecoAngebotId', $durchfuehrung->{'eco_angebot_id'});
                $durchfuehrungNodeTemplate->setProperty('ecoFachId', $durchfuehrung->{'eco_fach_id'});
                $durchfuehrungNodeTemplate->setProperty('status', $durchfuehrung->status);
                if (!empty($durchfuehrung->termine->termin)) {
                  $durchfuehrungNodeTemplate->setProperty('ort', $durchfuehrung->termine->termin[0]->ort);
                }

                $durchfuehrungNode = $categoryNode->getNode('executions')->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));
                // $durchfuehrungNode = $categoryNode->createNodeFromTemplate($durchfuehrungNodeTemplate, uniqid('courseExecution-'));

                $this->emitCourseCreated($durchfuehrungNode, $categoryNode);

              } // end $durchfuehrung
            }

          } // end version
      } // end kurs

      $this->persistenceManager->persistAll();

      // $arr = json_decode($jsonString);

      // foreach($arr as $item) { //foreach element in $arr
      //
      //     $categoryNodeTemplate = new NodeTemplate();
      //     $categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('schule.signalwerkCh:ContactItem'));
      //     $categoryNodeTemplate->setProperty('title', $item->vorname.' '.$item->name);
      //     $categoryNodeTemplate->setProperty('firstname', $item->vorname);
      //     $categoryNodeTemplate->setProperty('familyname', $item->name);
      //     $categoryNodeTemplate->setProperty('email', $item->mail);
      //     $categoryNode = $rootNode->createNodeFromTemplate($categoryNodeTemplate);
      //     $this->persistenceManager->persistAll();
      // }
      return 'Import all done. ';
    }

    public function importAction()
    {

      $msg = $this->deleteAllCourses();
      $msg .= $this->importCourse();

      $this->response->setStatus(201);
      return $msg; // 'Import all done. ';
    }






          // echo "$parentcategory -- $targetPath\n";
    			// 	$categoryNodeTemplate = new \TYPO3\TYPO3CR\Domain\Model\NodeTemplate();
    			// 	$categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType($categoryNodeType));
    			// 	$categoryNodeTemplate->setProperty('originalIdentifier', $category['uid']);
    			// 	$categoryNodeTemplate->setProperty('title', $category['title']);
    			// 	$categoryNode = $rootNode->createNodeFromTemplate($categoryNodeTemplate);

          // print_r($rootCourse);
          // $rootCourse = $this->context->getNodeByIdentifier('df6fcd9a-53fe-42bb-8e8e-074fe32cb2c5');

          // $chronikRootNode = $context->getNodeByIdentifier('529a59e2-1849-2782-471c-7635f47167de');
          // $chronikBranch = $chronikRootNode->getChildNodes('GSL.DuttweilerDe.Pages:ChronikBranch', 1)[0];







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
}
