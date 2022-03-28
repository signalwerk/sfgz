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

        $stauts="Start";

        /*do some stuff*/
        $query = new FlowQuery(array($this->context->getRootNode()));
        $query = $query->find('[instanceof signalwerk.sfgz:Course]');

        // filter by freetext
        if (!empty($_GET["filterTxt"])) {
            $query = $query->filter('[fulltext*="'.strtolower($_GET["filterTxt"]).'"]');
            $stauts.="\nfilterTxt:'".$_GET["filterTxt"]."'";
        }

        $query = $query->sort('sort', 'ASC');
        $query = $query->get();

        $data = [];
        foreach ($query as $course) {

            $executions = [];

            foreach ($course->getNode('executions')->getChildNodes('signalwerk.sfgz:CourseExecution') as $execution) {
      
                $executions[] = [
                    "id" => $course->getIdentifier(),
                    "start" => ["print"=> $execution->getProperty("start")->format('d.m.Y'), "sort" => (int)$execution->getProperty("start")->format('U')],
                    "end" => ["print"=> $execution->getProperty("end")->format('d.m.Y')],
                ];
            }

            $data[] = ["id" => $course->getIdentifier(), "coursid" => $course->getProperty('coursid'), "title" => $course->getProperty('title'), "executions" => $executions];
        }
        $stauts.="\nEnd";

        $data=array("filter"=>$stauts, "hits" => $data );
        return json_encode($data);
    }
}
