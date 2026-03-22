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

    protected function escapeFlowQueryLiteral($value)
    {
        return addcslashes((string)$value, "\\\"");
    }

    protected function requestFilterText()
    {
        $queryParams = $this->request->getHttpRequest()->getQueryParams();
        $filterText = isset($queryParams['filterTxt']) && is_string($queryParams['filterTxt']) ? trim($queryParams['filterTxt']) : '';

        if ($filterText === '') {
            return null;
        }

        $filterText = mb_substr($filterText, 0, 100);
        $filterText = preg_replace('/[^\pL\pN\s.,:_\/()\-]/u', '', $filterText);
        $filterText = trim((string)$filterText);

        return $filterText === '' ? null : $filterText;
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
        $filterText = $this->requestFilterText();
        if ($filterText !== null) {
            $query = $query->filter('[fulltext*="' . $this->escapeFlowQueryLiteral(mb_strtolower($filterText)) . '"]');
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
