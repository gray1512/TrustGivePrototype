RecipientApp = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    RecipientApp.initWeb3();
    RecipientApp.initContract();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      RecipientApp.web3Provider = web3.currentProvider;
    } else {
    // If no injected web3 instance is detected, fall back to Ganache
      RecipientApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(RecipientApp.web3Provider);
  },

  initContract: function() {
    $.getJSON('Donation.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var DonationArtifact = data;
      RecipientApp.contracts.Donation = TruffleContract(DonationArtifact);

      // Set the provider for our contract
      RecipientApp.contracts.Donation.setProvider(RecipientApp.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return RecipientApp.loadView();
    });
    return RecipientApp.bindEvents();
  },

  loadView: function() {
    RecipientApp.contracts.Donation.deployed().then(function(instance) {
      donationContract = instance;

      return donationContract.getCurrentStatus.call();
    }).then(function(message) {
      // update progress bar
      $('#status').text(message);
      // update progress bar
      var stt = message.toString(10);

      if (stt === "0") {
        $('#status').text('0% - Giving your goods now!');
        $('#step1').css('background-color', 'white');
        $('#step2').css('background-color', 'white');
        $('#step3').css('background-color', 'white');
        $('#step4').css('background-color', 'white');
        $('#step5').css('background-color', 'white');


      } else if (stt === "1") {
        $('#status').text('20% - Searching for recipient...');
        $('#step1').css('background-color', 'none');
        $('#step2').css('background-color', 'white');
        $('#step3').css('background-color', 'white');
        $('#step4').css('background-color', 'white');
        $('#step5').css('background-color', 'white');

      } else if (stt === "2") {
        $('#status').text('40% - We found it!');
        $('#step1').css('background-color', 'none');
        $('#step2').css('background-color', 'none');
        $('#step3').css('background-color', 'white');
        $('#step4').css('background-color', 'white');
        $('#step5').css('background-color', 'white');
        
      } else if (stt === "4") {
        $('#status').text('60% - Processing... Next location: You!');
        $('#step1').css('background-color', 'none');
        $('#step2').css('background-color', 'none');
        $('#step3').css('background-color', 'none');
        $('#step4').css('background-color', 'white');
        $('#step5').css('background-color', 'white');
        
      } else if (stt === "5") {
        $('#status').text('80% - It is there! You received it, right?');
        $('#step1').css('background-color', 'none');
        $('#step2').css('background-color', 'none');
        $('#step3').css('background-color', 'none');
        $('#step4').css('background-color', 'none');
        $('#step5').css('background-color', 'white');
      }  else {
        $('#status').text('100% - It is for you!');
        $('#step1').css('background-color', 'none');
        $('#step2').css('background-color', 'none');
        $('#step3').css('background-color', 'none');
        $('#step4').css('background-color', 'none');
        $('#step5').css('background-color', 'none');
      }
    }).catch(function(err) {
      $('#status').text(err.message);
      console.log();
    });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-received', RecipientApp.confirmReceived);
    $(document).on('click', '.btn-report', RecipientApp.sendReport);
  },

  sendSuccessful: function() {
    $('#status').text('Send Successful!');
  },

  confirmReceived: function(event) {
    event.preventDefault();

    var donationContract;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      RecipientApp.contracts.Donation.deployed().then(function(instance) {
        donationContract = instance;

        return donationContract.confirmReceived({from: accounts[0]});
      }).then(function(result) {
        //$('#status').text('Good luck!');
        //console.log(result.toString(10));
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  sendReport: function(event) {
    event.preventDefault();

    var donationContract;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      //var message = $("#short_description").val();  
      var message = "blblblblbl";  

      RecipientApp.contracts.Donation.deployed().then(function(instance) {
        donationContract = instance;

        return donationContract.throwWarning(message, {from: account});
      }).then(function(result) {
        return RecipientApp.sendSuccessful();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    RecipientApp.init();

    setInterval(function(){
      RecipientApp.loadView();
    }, 1000);
  });
});