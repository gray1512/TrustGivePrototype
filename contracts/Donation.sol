pragma solidity ^0.4.0;

contract Donation {
    enum Status {
        NONE,
        START_DONATION,
        MATCHED,
        ENDED,
        TRANSPORTING,
        DELIVERED,
        RECEIVED,
        WARNING
    }
    
    // addresses
    address private donor;
    address private organization;
    address private recipient;
    
    Status public currentStatus;
    string public description;
    
    modifier organizationOnly() {
        require(msg.sender == organization);
        _; // keep execute method's code
    }
    modifier donorOnly() {
        require(msg.sender == donor);
        _; // keep execute method's code
    } 
    modifier recipientOnly() {
        require(msg.sender == recipient);
        _; // keep execute method's code
    }
    modifier checkStatus(Status stt) {
        require(currentStatus == stt);
        _; // keep execute method's code
    }
    
    // Create a new transportation
    constructor() public {
        organization = msg.sender;
        currentStatus = Status.NONE;
    }
    
    function startDonation(address _donor, string _description) organizationOnly public {
        currentStatus = Status.START_DONATION;
        donor = _donor;
        description = _description;
    }
    
    function setRecipient(address _recipient) organizationOnly public {
        recipient = _recipient;
        currentStatus = Status.MATCHED;
    }
    
    function startTransporting(string _description) organizationOnly checkStatus(Status.MATCHED) public {
        currentStatus = Status.TRANSPORTING;
        description = _description;
    }
    
    function confirmDelevered() organizationOnly checkStatus(Status.TRANSPORTING) public {
        currentStatus = Status.DELIVERED;
    }
    
    function confirmReceived() recipientOnly checkStatus(Status.DELIVERED) public payable {
        currentStatus = Status.RECEIVED;
    }
    
    
    function throwWarning(string message) public {
        currentStatus = Status.WARNING;
        description = message;
    }
    
    function getCurrentStatus() view public returns (Status) {
        return currentStatus;
    }
}