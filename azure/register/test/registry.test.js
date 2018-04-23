const cryptoFunctions = require("../modules/cryptoFunctions");

const makeRegister = require('../modules/registry').makeRegister;

const expect = require('chai').expect;



it('makeRegister should not be null', () => {
    const register = createMockedRegister();
    expect(register).to.be.not.null;
})

it('happy path. all working', async () => {
    const register = createMockedRegister();
    var result = await register({ frameNumber: "frameNumber", email: "email", lastName: "lastName", firstName: "firstName" });
    expect(result.hasError).to.be.undefined;
})

it('no input should return an error', async () => {
    const register = createMockedRegister();
    var result = await register();
    expect(result.hasError).to.be.true;
})

it('no firstName should return an error', async () => {
    const register = createMockedRegister();
    var result = await register({ frameNumber: "frameNumber", email: "email", lastName: "lastName" });
    expect(result.hasError).to.be.true;
})

it('no lastName should return an error', async () => {
    const register = createMockedRegister();
    var result = await register({ frameNumber: "frameNumber", email: "email", firstName: "firstName" });
    expect(result.hasError).to.be.true;
})

it('should save with created user and private key', async () => {

    var saveCalled = false;
    const expectedUserId = "my expected user id";
    const expectedPrivateKey = "my expected private key";

    const cryptoFunctionsLocal = require("../modules/cryptoFunctions");

    cryptoFunctionsLocal.generateNewKey = () => { return { privateKeyString: expectedPrivateKey } }
    cryptoFunctionsLocal.sign = () => "not needed";

    const deps =
        {
            cryptoFunctions: cryptoFunctionsLocal,
            publicRepository: { save: () => "not needed", find: (doNothing) => {/*return nothing -> mock no existing record*/} },
            privateRepository: {
                save: (input) => {
                    expect(input.userId).to.equal(expectedUserId);
                    expect(input.privateKey).to.equal(expectedPrivateKey);
                    saveCalled = true;
                }
            },
            createUser: () => { return { objectId: expectedUserId, privateKey: expectedPrivateKey } },
            createBlockchainRecord: () => "not needed"
        }

    const register = makeRegister(deps);
    var result = await register({ frameNumber: "not needed", email: "not needed", firstName: "not needed", lastName: "not needed" });
    expect(saveCalled, "privateRepository.save() was not called").to.be.true;
})



function createMockedRegister() {
    const deps =
        {
            cryptoFunctions: cryptoFunctions,
            publicRepository: 1,
            privateRepository: 1,
            createUser: () => "user",
            createBlockchainRecord: () => "record"
        }

    const register = makeRegister(deps);
    return register;
}