<?php
namespace signalwerk\sfgz\FlowQuery;

use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Eel\FlowQuery\Operations\Object\FilterOperation;
use Neos\Utility\ObjectAccess;

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

            if (is_iterable($elementsFromProperty)) {
                foreach ($elementsFromProperty as $propertyElement) {
                    if ($this->matchesPropertyElement($propertyElement, $parsedFilter)) {
                        $filteredContext[] = $element;
                        break;
                    }
                }
            }
        }
        $flowQuery->setContext($filteredContext);
    }

    protected function matchesPropertyElement($propertyElement, array $parsedFilter): bool
    {
        $identifierOperand = $this->extractIdentifierOperand($parsedFilter);
        if ($identifierOperand !== null) {
            $propertyElementIdentifier = $this->extractIdentifier($propertyElement);

            return $propertyElementIdentifier !== null
                && strtolower($propertyElementIdentifier) === strtolower($identifierOperand);
        }

        return $this->matchesFilterGroup($propertyElement, $parsedFilter);
    }

    protected function extractIdentifierOperand(array $parsedFilter): ?string
    {
        foreach ($parsedFilter['Filters'] ?? [] as $filter) {
            if (isset($filter['IdentifierFilter'])) {
                return (string)$filter['IdentifierFilter'];
            }

            foreach ($filter['AttributeFilters'] ?? [] as $attributeFilter) {
                if (
                    ($attributeFilter['PropertyPath'] ?? null) === 'identifier'
                    && in_array((string)($attributeFilter['Operator'] ?? ''), ['=', '=~'], true)
                    && isset($attributeFilter['Operand'])
                ) {
                    return (string)$attributeFilter['Operand'];
                }
            }
        }

        return null;
    }

    protected function extractIdentifier($propertyElement): ?string
    {
        if (is_string($propertyElement)) {
            return $propertyElement;
        }

        if (is_array($propertyElement)) {
            foreach (['identifier', 'nodeAggregateIdentifier', 'aggregateId'] as $key) {
                if (!empty($propertyElement[$key])) {
                    return (string)$propertyElement[$key];
                }
            }

            return null;
        }

        if (!is_object($propertyElement)) {
            return null;
        }

        foreach (['getIdentifier', 'getNodeAggregateIdentifier', 'getAggregateId'] as $methodName) {
            if (method_exists($propertyElement, $methodName)) {
                try {
                    $identifier = $propertyElement->{$methodName}();
                    if ($identifier !== null && $identifier !== '') {
                        return (string)$identifier;
                    }
                } catch (\Throwable $exception) {
                }
            }
        }

        foreach (['identifier', 'nodeAggregateIdentifier', 'aggregateId'] as $propertyPath) {
            try {
                $identifier = ObjectAccess::getPropertyPath($propertyElement, $propertyPath);
                if ($identifier !== null && $identifier !== '') {
                    return (string)$identifier;
                }
            } catch (\Throwable $exception) {
            }
        }

        if ($propertyElement instanceof \Stringable) {
            return (string)$propertyElement;
        }

        return null;
    }
}
