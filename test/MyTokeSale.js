const MyTokenSale = artifacts.require('MyTokenSale');
const MyToken = artifacts.require('MyToken');
contract('MyTokenSale', (accounts) => {
  let myTokenSale, myToken;
  const [admin] = accounts;
  const tokenAvailable = 75000;
  const tokenPrice = 1000000000000000; //WEI
  before(async () => {
    myTokenSale = await MyTokenSale.deployed();
    myToken = await MyToken.deployed();
  });

  it('Initializes the contract with the correct values', async () => {
    assert.notEqual(myTokenSale.address, 0x0, 'Has contract address');
    const tokenContract = await myTokenSale.tokenContract();
    assert.notEqual(tokenContract, 0x0, 'Has token contract address');
    const _tokenPrice = await myTokenSale.tokenPrice();
    assert.equal(tokenPrice, _tokenPrice, 'token price is correct');
  });

  it('Facilitates token buying', async () => {
    const numberOfTokens = 10;
    const [, buyer] = accounts;
    // step-4
    // Provision 75% of all tokens to the token sale
    await myToken.transfer(myTokenSale.address, tokenAvailable, {
      from: admin
    });
    // step-2
    const { logs } = await myTokenSale.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * tokenPrice
    });
    const [
      {
        event,
        args: { _numberOfTokens, _buyer }
      }
    ] = logs;
    assert.equal(logs.length, 1, 'Triggered one events');
    assert.equal(event, 'Sell', 'should be the "Sell" event');
    assert.equal(_buyer, buyer, 'logs the account that purchased the tokens');
    assert.equal(
      _numberOfTokens,
      numberOfTokens,
      'logs the number of tokens purchased'
    );
    // step-1
    const soldTokens = await myTokenSale.tokensSold();
    assert.equal(
      soldTokens.toNumber(),
      numberOfTokens,
      'increments the number of tokens sold'
    );
    // step-3
    // Try to but tokes different from the ether value
    try {
      await myTokenSale.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1
      });
    } catch (error) {
      assert.equal(
        error.reason,
        'should value is equal to tokens price',
        'msg.value must equal number of tokens in wei'
      );
    }
    try {
      await myTokenSale.buyTokens(800000, {
        from: buyer,
        value: numberOfTokens * tokenPrice
      });
    } catch (error) {
      assert.equal(
        error.reason,
        'should value is equal to tokens price',
        'can not purchase more tokens than available'
      );
    }
  });
});
