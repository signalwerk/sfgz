export DOMAIN="sfgz.ch"
export PROJECT_IDENTIFIER="sfgz"
export PROJECT_VENDOR="signalwerk"




file="./Packages/Sites/$PROJECT_VENDOR.$PROJECT_IDENTIFIER/Resources/Private/Content/Sites_all.xml"
./flow site:export > $file


file="./Packages/Sites/$PROJECT_VENDOR.$PROJECT_IDENTIFIER/Resources/Private/Content/Sites.xml"
./flow site:import $file
