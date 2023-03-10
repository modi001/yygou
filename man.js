App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
      // Load pets.
      $.getJSON('../pets.json', function(data) {
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
  
          petTemplate.find('.btn-amount').attr('data-id', data[i].id);
          petTemplate.find('.btn-amount').attr('id', "id" + data[i].id);

          petTemplate.find('.btn-setRollback').attr('data-id', data[i].id);
          petTemplate.find('.btn-setRollback').attr('id', "id" + data[i].id);

          petTemplate.find('.btn-open').attr('data-id', data[i].id);
          petTemplate.find('.btn-open').attr('id', "id" + data[i].id);

          petTemplate.find('.btn-onsale').attr('data-id', data[i].id);
          petTemplate.find('.btn-onsale').attr('id', "id" + data[i].id);
  
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
        App.contracts.TestNFT.setProvider(App.web3Provider);
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
      $(document).on('click', '.btn-mint', App.handleMint); // 领测试NFT
      $(document).on('click', '.btn-onsale', App.handleOnSale); // 上架
      $(document).on('click', '.btn-amount', App.handleAmountByGoodID); // 商品总投注额

      $(document).on('click', '.btn-minXiazhu', App.handleSetTouzhu); // 最小投注金额
      $(document).on('click', '.btn-open', App.handleSetOpen); // 开奖
      $(document).on('click', '.btn-setRollback', App.handleSetRollback); // 设置流拍
    },
  
    // 创建NFT
    handleMint: function(event) {
      event.preventDefault();
  
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.TestNFT.deployed().then(function(instance) {
          nftInstance = instance;
          return nftInstance.safeMint(account, "fakeURI", {from: account});
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },
  
    // 设置为上架
    handleOnSale: function(event) {
      event.preventDefault();
  
      var petId = parseInt($(event.target).data('id'));
  
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.Buy.deployed().then(function(instance) {
          buyInstance = instance;
          return buyInstance.setGoodStatus(petId, 1, {from: account});
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    // 设置为流拍
    handleSetRollback: function(event) {
      event.preventDefault();
  
      var petId = parseInt($(event.target).data('id'));
  
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.Buy.deployed().then(function(instance) {
          buyInstance = instance;
          alert(petId);
          return buyInstance.setGoodStatus(petId, 2, {from: account});
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    // 开奖
    handleSetOpen: function(event) {
      event.preventDefault();
  
      var petId = parseInt($(event.target).data('id'));
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
        // 授权
        App.contracts.TestNFT.deployed().then(function(instance) {
          nftInstance = instance;
          nftInstance.approve('0xA76b5588874b362Bb009feD677b9b520F22455b6', 0, {from: account});
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });

        //开奖派奖
        App.contracts.Buy.deployed().then(function(instance) {
          buyInstance = instance;
          return buyInstance.openLotty(12345, 0, 0, "0x14c203C64b8e76B708555938a7C4890a536c2bCA", {from: account});
        }).then(function(result) {
          //console.log(parseInt(result));
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    // 设置最小下注额
    handleSetTouzhu: function(event) {
      event.preventDefault();
      var count = document.getElementById("minTouzhu").value;
      alert("最小下注额:" + count + " ETH");
  
      web3.eth.getAccounts(function(error) {
        if (error) {
          console.log(error);
        }
  
        App.contracts.Buy.deployed().then(function(instance) {
          buyInstance = instance;
          //return buyInstance.setGoodStatus(petId, 1, {from: account});
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
  
    },
  
    // 某个商品的总投注金额(ETH)
    handleAmountByGoodID: function(event) {
      event.preventDefault();
  
      var petId = parseInt($(event.target).data('id'));
      web3.eth.getAccounts(function(error) {
        if (error) {
          console.log(error);
        }
        
        App.contracts.Buy.deployed().then(function(instance) {
          buyInstance = instance;
          return buyInstance.getAmountByGoodID(petId);
        }).then(function(result) {
          var amount = parseInt(result) / (10 ** 18);
          alert("总金额:" + amount + " ETH");
          console.log(amount);
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
  