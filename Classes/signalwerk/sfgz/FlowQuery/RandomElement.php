<?php
namespace signalwerk\sfgz\FlowQuery;

use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Eel\FlowQuery\Operations\AbstractOperation;

class RandomElement extends AbstractOperation
{

        /**
         * {@inheritdoc}
         *
         * @var string
         */
    protected static $shortName = 'randomElement';

    /**
     * {@inheritdoc}
     *
     * @param FlowQuery $flowQuery the FlowQuery object
     * @param array $arguments the arguments for this operation
     * @return void
     */
    public function evaluate(FlowQuery $flowQuery, array $arguments)
    {
        $context = $flowQuery->getContext();
        $randomKey = array_rand($context);
        $result = array($context[$randomKey]);
        $flowQuery->setContext($result);
    }
}
