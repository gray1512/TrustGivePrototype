Organization = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return Organization.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      Organization.web3Provider = web3.currentProvider;
    } else {
    // If no injected web3 instance is detected, fall back to Ganache
      Organization.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(Organization.web3Provider);

    return Organization.initContract();
  },

  initContract: function() {
    $.getJSON('Donation.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var DonationArtifact = data;
      Organization.contracts.Donation = TruffleContract(DonationArtifact);

      // Set the provider for our contract
      Organization.contracts.Donation.setProvider(Organization.web3Provider);

      return Organization.loadView();
    });

    return Organization.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-donor', Organization.startDonation);
    $(document).on('click', '.btn-rec', Organization.setRecipient);
    $(document).on('click', '#start', Organization.startTransporting);
    $(document).on('click', '#delivered', Organization.setDelivered);
  },

  loadView: function() {
    var donationInstance;

    Organization.contracts.Donation.deployed().then(function(instance) {
      donationInstance = instance;

      return donationInstance.getCurrentStatus.call();
    }).then(function(message) {
      // update progress
      var stt = message.toString(10);

      if (stt === "0") {

      } else if (stt === "1") {
        $('#new-donor').text('Added donor');
        $('#new-rec').text('Add new recipient').attr('hidden', false);

      } else if (stt === "2") {        
        $('#new-donor').text('Added donor');
        $('#new-rec').removeAttr('hidden');
        $('#new-rec').text('Added recipient');
        $('#start').text('Start the process now!').removeAttr('hidden');

      } else if (stt === "4") {
        $('#new-donor').text('Added donor');
        $('#new-rec').removeAttr('hidden');
        $('#new-rec').text('Added recipient');
        $('#start').text('Started!');
        $('#start').removeAttr('hidden');
        $('#delivered').removeAttr('hidden');

      } else if (stt === "5") {
        $('#new-donor').text('Added donor');
        $('#new-rec').removeAttr('hidden');
        $('#new-rec').text('Added recipient');
        $('#start').text('Started!');
        $('#start').removeAttr('hidden');
        $('#delivered').text('Delivered!');
        $('#delivered').removeAttr('hidden');
      }

      console.log(message.toString(10));
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  startDonation: function(event) {
    event.preventDefault();

    var publickey = $('#donor-key').val();

    var donationInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      Organization.contracts.Donation.deployed().then(function(instance) {
        donationInstance = instance;

        return donationInstance.startDonation(publickey, 'We collected your goods!', {from: account});
      }).then(function(result) {
        Organization.loadView();
        $('#status').text('We collected your goods!');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  setRecipient: function(event) {
    event.preventDefault();

    var publickey = $('#rec-key').val();

    var donationInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      Organization.contracts.Donation.deployed().then(function(instance) {
        donationInstance = instance;

        return donationInstance.setRecipient(publickey, {from: account});
      }).then(function(result) {
        Organization.loadView();
        console.log(result.toString(10));
        //$('#status').text('Matched');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  startTransporting: function(event) {
    event.preventDefault();

    var donationInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      Organization.contracts.Donation.deployed().then(function(instance) {
        donationInstance = instance;

        return donationInstance.startTransporting('Processing...', {from: account});
      }).then(function(result) {
        Organization.loadView();        
        $('#status').text('Processing...');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  setDelivered: function(event) {
    event.preventDefault();

    var donationInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      Organization.contracts.Donation.deployed().then(function(instance) {
        donationInstance = instance;

        return donationInstance.confirmDelevered({from: account});
      }).then(function(result) {
        Organization.loadView();        
        $('#status').text('Processing...');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    Organization.init();

    setInterval(function(){
      Organization.loadView();
    }, 1000);
  });
});
