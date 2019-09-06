pragma solidity ^0.5.0;

contract MyToken {
    string public name = "MyApp Token";
    string public symbol = "MyApp";
    string public standard = "MyApp Token V1.0";
    uint256 public totalSupply;
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256 )) public allowance;
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
     event Approval (address indexed _owner, address indexed _spender, uint256 _value);
    constructor(uint256 _initialSupply) public {
        // Allocate the initial supply token to admin account
        balanceOf[msg.sender] = _initialSupply;
        // Allocate the initial supply
        totalSupply = _initialSupply;
    }
    // Transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesn't have eniugh balance
        require(balanceOf[msg.sender] >= _value);
        // Transfer the ownership
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // Transfer Event
        emit Transfer(msg.sender,_to,_value);
        // return a boolean
        return true;        
    }
    // approve 
    function approve(address _spender,uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require _from has enough token
        require(_value <= balanceOf[_from],'Spender has not enough balance');        
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender], 'Require allowance is big enough');
        // Change the balance 
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
         // Update the allowance
         allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from,_to,_value);
        // return a boolean 
        return true;
        
    }
}