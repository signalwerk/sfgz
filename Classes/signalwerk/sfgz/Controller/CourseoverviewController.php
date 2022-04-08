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
use \stdClass;
use \DOMDocument;

/**
 * Courseoverview controller for the site package
 */
class CourseoverviewController extends ActionController
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

    /**
    * @param string $action
    */
    public function getAjaxDataAction($action)
    {


        /*do some stuff*/
        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:Course]');

        // filter by freetext
        if (!empty($_GET["filterTxt"])) {
            $query = $query->filter('[fulltext*="'.strtolower($_GET["filterTxt"]).'"]');
            // $stauts.="\nfilterTxt:'".$_GET["filterTxt"]."'";
        }

        $query = $query->sort('sort', 'ASC');
        $query = $query->get();

        $data = [];
        foreach ($query as $course) {

            $executions = [];
            $categories = [];

            $currentCategories = $course->getProperty("categories");
            foreach ($currentCategories as $category) {
                $categories[] = $category->getIdentifier();
            }

            foreach ($course->getNode('executions')->getChildNodes('signalwerk.sfgz:CourseExecution') as $execution) {
      
                $start = $execution->getProperty("start");
                $end = $execution->getProperty("end");

                $executions[] = [
                    "id" => $course->getIdentifier(),
                    "start" => ["print"=> $start ? $start->format('d.m.Y') : '', "sort" => $start ? (int)$start->format('U') : -1],
                    "end" => ["print"=> $end ? $end->format('d.m.Y') : ''],
                ];
            }

            $data[] = ["id" => $course->getIdentifier(), "coursid" => $course->getProperty('coursid'), "title" => $course->getProperty('title'), "categories" => $categories, "executions" => $executions];
        }
        
        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:CourseCategory]');
        $query = $query->sort('title', 'ASC');
        $query = $query->get();
        $categories = [];

        foreach ($query as $category) {
            $categories[] = ["id" => $category->getIdentifier(), "title" => $category->getProperty("title")];
        }

        $stauts = "OK";

        $data=array("status"=>$stauts, "categories"=>$categories, "hits" => $data );
        return json_encode($data);
    }
}
