const MyToken = artifacts.require('MyToken');

contract('MyToken', (accounts) => {
  let mytoken;

  before(async () => {
    mytoken = await MyToken.deployed();
  });

  it('Initializes the contract with the correct values', async () => {
    const name = await mytoken.name();
    assert.equal(name, 'MyApp Token', 'Has the correct name');
    const symbol = await mytoken.symbol();
    assert.equal(symbol, 'MyApp', 'Has the correct symbol');
    const standard = await mytoken.standard();
    assert.equal(standard, 'MyApp Token V1.0', 'Has the correct standard');
  });

  it('Set total supply upon deployment', async () => {
    const totalSupply = await mytoken.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      1000000,
      'Set the total supply to 1,000,000'
    );
  });

  it("Allocate initial supplied token to creator's account", async () => {
    const adminBalance = await mytoken.balanceOf(accounts[0]);
    assert.equal(
      adminBalance.toNumber(),
      1000000,
      'Allocate the initial supplied tokens to Admin Account'
    );
  });

  it('Transfer token wonership', async () => {
    try {
      await mytoken.transfer.call(accounts[1], 99999999);
    } catch (error) {
      assert(
        error.message.indexOf('revert') >= 0,
        'Error message must contain revert'
      );
      const success = await mytoken.transfer.call(accounts[1], 250000, {
        from: accounts[0]
      });
      assert.equal(success, true, 'Transaction done successfully.');
      const receipt = await mytoken.transfer(accounts[1], 250000, {
        from: accounts[0]
      });
      assert.equal(receipt.logs.length, 1, 'Triggered one events');
      assert.equal(
        receipt.logs[0].args._from,
        accounts[0],
        'logs the account the tokens are transferred from'
      );
      assert.equal(
        receipt.logs[0].args._to,
        accounts[1],
        'logs the account the tokens are transferred to'
      );
      assert.equal(
        receipt.logs[0].args._value,
        250000,
        'logs the transferred amount'
      );
      const balanceAcc1 = await mytoken.balanceOf(accounts[1]);
      assert.equal(
        balanceAcc1.toNumber(),
        250000,
        'Adds amount to the receiving account.'
      );
      const balanceAcc0 = await mytoken.balanceOf(accounts[0]);
      assert.equal(
        balanceAcc0.toNumber(),
        750000,
        'Deduct the amount from sending account'
      );
    }
  });

  it('Approves token for delegate accounts ', async () => {
    const success = await mytoken.approve.call(accounts[1], 100); // doesn't perform the transaction only inspect the return valur of function.
    assert.equal(success, true, 'it returns true');
    const receipt = await mytoken.approve(accounts[1], 100); // Do the transaction
    assert.equal(receipt.logs.length, 1, 'Triggered one events');
    assert.equal(
      receipt.logs[0].event,
      'Approval',
      'shoul be the Approval event'
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      'logs the account the tokens are authorized by'
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      'logs the account the tokens are authrozied to'
    );
    assert.equal(
      receipt.logs[0].args._value,
      100,
      'logs the transferred amount'
    );
    const allowance = await mytoken.allowance(accounts[0], accounts[1]);
    assert.equal(allowance, 100, 'store the allowance for delegate transfer');
  });
  it('Handles delegated token transfers', async () => {
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAccount = accounts[4];
    // Transfer some tokens to fromAccount
    await mytoken.transfer(fromAccount, 100, { from: accounts[0] });
    // Approve spendingAccount to spend 10 token from fromAccount
    await mytoken.approve(spendingAccount, 10, { from: fromAccount });
    // Try transferring something larger than the sender's balance
    try {
      await mytoken.transferFrom(fromAccount, toAccount, 9999, {
        from: spendingAccount
      });
    } catch ({ reason }) {
      assert.equal(
        reason,
        'Spender has not enough balance',
        'can not transfer value larger than the balance'
      );
    }
    try {
      // Try transferring something larger than the approved account
      await mytoken.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAccount
      });
    } catch ({ reason }) {
      assert.equal(
        reason,
        'Require allowance is big enough',
        'can not transfer value larger than the approved balance'
      );
    }
    const success = await mytoken.transferFrom.call(
      fromAccount,
      toAccount,
      10,
      { from: spendingAccount }
    );
    assert.equal(success, true);
    const { logs } = await mytoken.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount
    });
    const [
      {
        event,
        args: { _from, _to, _value }
      }
    ] = logs;
    assert.equal(logs.length, 1, 'Triggered one events');
    assert.equal(event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(
      _from,
      fromAccount,
      'logs the account the tokens are transferred from'
    );
    assert.equal(
      _to,
      toAccount,
      'logs the account the tokens are transferred to'
    );
    assert.equal(_value, 10, 'logs the transfer amount');
    const BalOfFromAccount = await mytoken.balanceOf(fromAccount);
    assert.equal(
       BalOfFromAccount.toNumber(),
       90,
       'deducts the amount from sending account.'
    );
    const BalOfToAccount = await mytoken.balanceOf(toAccount);
    assert.equal(
      BalOfToAccount.toNumber(),
      10,
      'adds the amount from receiving account.'
    );
    const allowance = await mytoken.allowance(fromAccount, spendingAccount);
    assert.equal(allowance.toNumber(), 0, 'deduct the amount from the allowance');
  });
});
