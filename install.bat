echo "Installing configuration files..."
if not exist configs\general.js (
    copy configs\general.config.js configs\general.js
)
if not exist configs\server.js (
    copy configs\server.config.js configs\server.js
)
if not exist configs\reactor.js (
    copy configs\reactor.config.js configs\reactor.js
)
if not exist configs\facets.js (
    copy configs\facets.config.js configs\facets.js
)
if not exist plugins\email\config.js (
    copy plugins\email\config.sample.js plugins\email\config.js
)
echo "Installing bower and npm packages..."
bower install & npm install

