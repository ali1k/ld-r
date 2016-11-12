echo "Installing configuration files..."
if not exist configs\general.js (
    copy configs\general.sample.js configs\general.js
)
if not exist configs\server.js (
    copy configs\server.sample.js configs\server.js
)
if not exist configs\reactor.js (
    copy configs\reactor.sample.js configs\reactor.js
)
if not exist configs\facets.js (
    copy configs\facets.sample.js configs\facets.js
)
if not exist plugins\email\config.js (
    copy plugins\email\config.sample.js plugins\email\config.js
)
echo "Installing npm packages..."
npm install
