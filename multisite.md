export DOMAIN="sfgz.ch"
export PROJECT_IDENTIFIER="sfgz"
export PROJECT_VENDOR="signalwerk"




file="./Packages/Sites/$PROJECT_VENDOR.$PROJECT_IDENTIFIER/Resources/Private/Content/Sites_all.xml"
./flow site:export > $file


file="./Packages/Sites/$PROJECT_VENDOR.$PROJECT_IDENTIFIER/Resources/Private/Content/Sites.xml"
./flow site:import $file



## update 4.3
composer require --no-update "neos/neos:~4.3.0"
composer require --no-update "neos/nodetypes:~4.3.0"

composer require --no-update "neos/fusion-afx:~1.3"
composer require --no-update "neos/neos-ui:~3.3"

composer update

./flow doctrine:migrate

# Flush the caches
./flow flow:cache:flush --force
./flow flow:session:destroyAll
