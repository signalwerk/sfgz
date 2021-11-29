## sfgz.ch – Neos Package
Dieses Repo beinhaltet die NEOS-Daten von [sfgz.ch](https://sfgz.ch/). Basierend auf dem [Kantonalen Styleguide](http://mba.styleguide.digital/)

### Technics
To get more informations about how to setup the site see `technics.md`

### Transition
Diese Website wurde ursprünglich für NEOS 3 erstellt und [afx](https://docs.neos.io/cms/manual/rendering/afx) existierte noch nicht. Alle alten Komponenten sind somit unter `/signalwerk.sfgz/Resources/Private/Fusion/NodeTypes` zu finden. Die neuen Komponenten mit afx sind unter `/signalwerk.sfgz/Resources/Private/Fusion/Components`.


### rebuild package

```bash
php -d memory_limit=3024M /usr/local/bin/composer require neos/form-builder "1.3.0"
php -d memory_limit=3024M /usr/local/bin/composer require networkteam/neos-mailobfuscator 2.2.2
php -d memory_limit=3024M /usr/local/bin/composer require breadlesscode/neos-blog 2.0.5
```

### Clear cache
```bash
FLOW_CONTEXT=Production php flow flow:cache:flush --force
```

### Update Version 4 to Version 5
```bash
# https://docs.neos.io/cms/references/upgrade-instructions/upgrade-instructions-4-3-5-0
cd /installation-root/
# Update the core package dependencies
composer require --no-update "neos/neos:~5.0.0"
composer require --no-update "neos/nodetypes:~5.0.0"

# Update optional package dependencies (if installed)
composer require --no-update "neos/demo:~6.0.0"
composer require --no-update "neos/site-kickstarter:~5.0.0"


# Update the packages
composer update

# Flush the caches
./flow flow:cache:flush --force
./flow flow:session:destroyAll

# Run code migrations (as needed for any packages that need to be migrated)
./flow flow:core:migrate <Vendor.PackageName>

# If not already on 4.0 or 4.1, set database charset and update to the new default given character set and collation
./flow database:setcharset

# Run database migrations
./flow doctrine:migrate

# Publish resources
./flow resource:publish







# add
composer require neos/form-builder

# check:
composer require networkteam/neos-mailobfuscator
```


<!-- generated package -->

## INFOS used to run Scripts
```bash
export DOMAIN="sfgz.ch"
export PROJECT_IDENTIFIER="sfgz"
export PROJECT_VENDOR="signalwerk"
```

## BEM-CSS
CSS classes are named after [BEM](https://cssguidelin.es/#bem-like-naming).
* Elements are separated by two underscores (`__`).
* modifiers are separated by two hyphens (`--`)



## TODO
* Right now there are two Elements on the Start-Page «news-items» and blog-items. Need to clean up?


### Lizenz
Jeglicher Code in [diesem Repository](https://github.com/signalwerk/sfgz/) steht unter [MIT-Lizenzierung](https://opensource.org/licenses/MIT).
