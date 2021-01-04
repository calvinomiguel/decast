# copy the readable-stream implementation from nodejs
rm -rf ./lib || true
cp ./node_modules/readable-stream/readable-browser.js ./index.js
cp ./node_modules/readable-stream/errors.js ./errors.js
cp ./node_modules/readable-stream/experimentalWarning.js ./experimentalWarning.js
cp -r ./node_modules/readable-stream/lib ./lib

# replace the inherit import by just util.inherits
grep -r -l "require('inherits')" * | grep -v build.sh | grep -v node_modules | xargs sed -i '' "s/require('inherits')/require('util')\.inherits/g"

# replace the inherit import by just util.inherits
grep -r -l "require('util-deprecate')" * | grep -v build.sh | grep -v node_modules | xargs sed -i '' "s/require('util-deprecate')/require('util')\.deprecate/g"

# replace the internal require by events
grep -r -l "require('./internal/streams/stream')" * | grep -v build.sh | grep -v node_modules | xargs sed -i '' "s/require('\.\/internal\/streams\/stream')/require('events')/g"

# replace the global. by nothing
grep -r -l "global." * | grep -v build.sh | grep -v node_modules | xargs sed -i '' "s/global\.//g"
