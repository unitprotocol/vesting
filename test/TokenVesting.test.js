const { time } = require('@openzeppelin/test-helpers')

const TokenVesting = artifacts.require('TokenVesting')
const ERC20 = artifacts.require('ERC20')

contract('TokenVesting', function (accounts) {
    const beneficiary = accounts[1]
    const cliff = 0
    const year = 365 * 24 * 3600 // in seconds
    const duration = 5 * year
    const vestingAmount = 100e18.toString()

    beforeEach('deploying', async function () {
        this.token = await ERC20.new("Test Token", "TEST", vestingAmount)
        const start = await time.latest()
        this.vesting = await TokenVesting.new(beneficiary, start, cliff, duration)
    })

    it('vesting', async function () {
        await this.token.transfer(this.vesting.address, vestingAmount)

        await time.increase(100)

        await this.vesting.release(this.token.address)

        const released100s = await this.token.balanceOf(beneficiary)

        expect(released100s < vestingAmount / 5 * 365 && released100s > 0).to.equal(true);

        await time.increase(duration)

        await this.vesting.release(this.token.address)

        const released = await this.token.balanceOf(beneficiary)

        expect(released.toString()).to.equal(vestingAmount);
    });
})