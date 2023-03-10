App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].min);
        petTemplate.find('.token-id').text(data[i].tokenid);
        
        var tmpAddr = data[i].contractaddr.substr(0, 6);
        tmpAddr += '**' + data[i].contractaddr.substr(data[i].contractaddr.length - 4, 4);
        petTemplate.find('.contract-addr').text(tmpAddr);
        petTemplate.find('.contract-addr').attr('id', "contract" + data[i].id);

        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-money').attr('id', "id" + data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
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


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('TestNFT.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var nftArtifact = data;
      App.contracts.TestNFT = TruffleContract(nftArtifact);
    
      // Set the provider for our contract
      App.contracts.TestNFT.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
    });

    $.getJSON('Buy.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var buyArtifact = data;
      App.contracts.Buy = TruffleContract(buyArtifact);
    
      // Set the provider for our contract
      App.contracts.Buy.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-myorder', App.handleMyOrder); // 我的订单
    $(document).on('click', '.btn-rollback', App.handleRollback);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  // 我的订单
  handleMyOrder: function(event) {
    event.preventDefault();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;
        return buyInstance.getOrder({from: account});
      }).then(function(result) {
        for (i = 0; i < result.length; i++) {
          console.log("user:" + result[i].user + ", 商品ID:" + result[i].id + ", 下单金额:" + result[i].amount * 0.001 + " ETH");
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  },

  // 用户拿回流拍商品的投注金额
  handleRollback: function(event) {
    event.preventDefault();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;
        return buyInstance.rollBack({from: account});
      }).then(function(result) {
        console.log("撤资:" + result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  },

  // 下单购买
  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var nameStr = 'id' + petId;
    var count = document.getElementById(nameStr).value;
    //var contractAddr = document.getElementById("contract" + petId).innerText;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;

        // Execute adopt as a transaction by sending account
        if (count < 0.001) {
          alert("下单金额太小:" + count);
          return;
        }
        var tmp = count * (10**18);
        return buyInstance.buy(petId, {from: account, value: tmp});
      }).then(function(result) {
        console.log(result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
