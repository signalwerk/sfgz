<?php
// https://github.com/ttreeagency/Fusion.HashFile/blob/master/Classes/HashFileImplementation.php
namespace signalwerk\sfgz\Fusion;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Flow\Annotations as Flow;
class HashFileImplementation extends AbstractFusionObject
{
    /**
     * @var ResourceManager
     * @Flow\Inject
     */
    protected $resourceManager;
    public function evaluate(): string
    {
        return \substr(\hash_file($this->fusionValue('algo'), $this->fusionValue('uri')), 0, 8);
    }
}
