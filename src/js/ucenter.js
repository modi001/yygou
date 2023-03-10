App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);


    return await App.initContract();
  },

  initContract: function() {
    $.getJSON('Buy.json', function(data) {
      var buyArtifact = data;
      App.contracts.Buy = TruffleContract(buyArtifact);
      App.contracts.Buy.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-view', App.myOrder); // 我的订单
  },

  myOrder: async function() {
    // Load pets.
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;
        return buyInstance.getOrder({from: account});
      }).then(function(result) {
        var petsRow = $('#petsRow');
        var petTemplate = $('#petTemplate');
        for (i = 0; i < result.length; i++) {
          ///////////////////////////
          petTemplate.find('.panel-title').text(result[i].user);         // 用户
          petTemplate.find('.token-id').text(result[i].id);               // 商品ID
          petTemplate.find('.pet-age').text(result[i].amount * 0.001);  // 下单金额
          petsRow.append(petTemplate.html());
        
          //console.log("user:" + result[i].user + ", 商品ID:" + result[i].id + ", 下单金额:" + result[i].amount * 0.001 + " ETH");
          //////////////////////////
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });

    return;
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
