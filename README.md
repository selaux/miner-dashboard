# miner-dashboard

[![Build Status](https://travis-ci.org/selaux/miner-dashboard.png)](https://travis-ci.org/selaux/miner-dashboard)
[![Build Status](https://david-dm.org/selaux/miner-dashboard.png)](https://david-dm.org/selaux/miner-dashboard)
[![tip for next commit](http://tip4commit.com/projects/563.svg)](http://tip4commit.com/projects/563)

Node.js based app to show the current status of your miner in a browser.

#### Features
- Display miner information
- Display market information
- Display revenue
- E-Mail-Notifications when miner falls below hashrate

#### Screenshot

[![Miner Dashboard](http://i.imgur.com/ldgQ33v.png)](http://i.imgur.com/ldgQ33v.png)


## Installation

Requirements: nodejs >= 0.10

Step 1: Clone the repository or [download the current version](https://github.com/selaux/miner-dashboard/releases) and extract it.

```
git clone https://github.com/selaux/miner-dashboard.git
```

Step 2: Copy example configuration

```
cd miner-dashboard
mv config/config.example.js config/config.js
```

Step 3: Adapt `config/config.js` to match your mining setup. The [Module List](https://github.com/selaux/miner-dashboard#modules) to shows available modules and how they are set up.

Step 4: Start the application

```
npm start
```

Step 5: Visit url and check if everything works.

```
http://localhost:3000
```

## Modules

Note: Each module can have an unique id assigned in the configuration object, so it can be referenced by another module.

#### Miners

- [BFGMiner](https://github.com/selaux/miner-dashboard/wiki/BFGMiner)
- [CGMiner](https://github.com/selaux/miner-dashboard/wiki/CGMiner)
- [Aggregated Hashrate](https://github.com/selaux/miner-dashboard/wiki/Aggregated-Hashrate)

#### Markets

- [bitcoincharts.com](https://github.com/selaux/miner-dashboard/wiki/bitcoincharts.com)

#### Notifications

- [E-Mail](https://github.com/selaux/miner-dashboard/wiki/Mail)

#### Revenue

- [For Solo Mining](https://github.com/selaux/miner-dashboard/wiki/solo) (Also usable as an estimate when mining in a pool)

#### Technical Info

- [blockchain.info](https://github.com/selaux/miner-dashboard/wiki/bitcoincharts.com)

## Changelog

#### 0.2.0
- a bunch of stability enhancements
- pools are displayed for each miner
- devices have better style (especially when having a lot of them)
- hardware error percentage is taken from miner response if included
- better number / hashrate / date formatting
- triplemining.com revenue module

#### 0.1.2
- improves stability when public apis are not available or return erronous responses

#### 0.1.1
- fixes #1: crash when log interval of cg/bfgminer is set to something else then 5min
- fixes #2: crash when cg/bfgminer does not send full payload in a single packet

## License

(The MIT License)

Copyright (c) 2013 Stefan Lau <github@stefanlau.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
