const shell = require('node-powershell');

let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

ps.addCommand('./snippet.ps1');
ps.invoke()
.then(output => {
  console.log(output);
  ps.dispose();
})
.catch(err => {
  console.log(err);
  ps.dispose();
});