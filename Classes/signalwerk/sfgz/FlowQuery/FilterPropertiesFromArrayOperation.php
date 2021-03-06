<?php
namespace signalwerk\sfgz\FlowQuery;

use Neos\Eel\FlowQuery\FlowQuery;

use Neos\Eel\FlowQuery\Operations\Object\FilterOperation;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\NodeInterface;

class FilterPropertiesFromArrayOperation extends FilterOperation
{

    /**
     * {@inheritdoc}
     *
     * @var string
     */
    protected static $shortName = 'filterPropertiesFromArray';

    /**
     * {@inheritdoc}
     *
     * @param \Neos\Eel\FlowQuery\FlowQuery $flowQuery the FlowQuery object
     * @param array $arguments the filter expression to use (in index 0)
     * @return void
     * @throws \Neos\Eel\FlowQuery\FizzleException
     */
    public function evaluate(\Neos\Eel\FlowQuery\FlowQuery $flowQuery, array $arguments)
    {
        if (!isset($arguments[0]) || empty($arguments[0])) {
            return;
        }
        if (!is_string($arguments[0])) {
            throw new \Neos\Eel\FlowQuery\FizzleException('filter operation expects string argument', 1332489625);
        }
        $filter = $arguments[0];

        $propertyName = $arguments[1];


        $parsedFilter = \Neos\Eel\FlowQuery\FizzleParser::parseFilterGroup($filter);

        $filteredContext = array();
        $context = $flowQuery->getContext();
        foreach ($context as $element) {
            $elementsFromProperty = $element->getProperty($propertyName);

            if ($elementsFromProperty) {
                foreach ($elementsFromProperty as $propertyElement) {
                    if ($this->matchesFilterGroup($propertyElement, $parsedFilter)) {
                        $filteredContext[] = $element;
                        break;
                    }
                }
            }
        }
        $flowQuery->setContext($filteredContext);
    }
}
