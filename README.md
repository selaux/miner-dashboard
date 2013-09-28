# miner-dashboard

[![Build Status](https://travis-ci.org/selaux/miner-dashboard.png)](https://travis-ci.org/selaux/miner-dashboard)
[![Build Status](https://david-dm.org/selaux/miner-dashboard.png)](https://david-dm.org/selaux/miner-dashboard)

Node.js based app to show the current status of your miner in the web.

## Installation

Requirements: nodejs >= 0.8

Step 1: Clone the repository

```
git clone https://github.com/selaux/miner-dashboard.git
```

Step 2: Enter the directory and adapt the configuration

```
cd miner-dashboard
mv config/config.example.json config/config.json
vim config/config.json
```

Step 3: Start the application

If yo're on Linux / Mac
```
npm start
```

If yo're on Windows:
```
npm startWin
```

Step 4: Visit url

```
http://localhost:3000
```