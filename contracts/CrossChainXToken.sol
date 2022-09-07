// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarExecutable.sol";
import "@axelar-network/axelar-cgp-solidity/contracts/interfaces/IAxelarGasService.sol";
import "./Xtokens.sol";

interface IXC20Wrapper {
    function wrap(address axelarToken, uint256 amount) external;
    function unwrap(address wrappedToken, uint256 amount) external;
}

// Moonbase Alpha: 0x87f6Fec8625BaC3efDAF537C3C8058C1a88d9467
contract ReceiveCrossChainXToken is IAxelarExecutable {

    IXC20Wrapper constant wrapper = IXC20Wrapper(0x798ce91BBfa900B4680904D4d8d560dAf11D7a98);
    IERC20 constant aUSDC = IERC20(0xD1633F7Fb3d716643125d6415d4177bC36b7186b);
    IERC20 constant xUSDC = IERC20(0xffFfFffeFd9d0bf45a2947A519a741c4b9E99EB6);
    Xtokens constant xt = Xtokens(0x0000000000000000000000000000000000000804);

    constructor(address _gateway) IAxelarExecutable(_gateway) {}
    
    event aUSDCBalance(uint256 balance);
    event xUSDCBalance(uint256 balance);
    event MultiassetCall(Xtokens.Multilocation, uint256, Xtokens.Multilocation, uint64);
    event MultiassetError(bytes);

    function _executeWithToken(
        string memory, //sourceChain
        string memory, //sourceAddress
        bytes calldata payload,
        string memory, //tokenSymbol
        uint256 amount
    ) override internal {
        // Doesn't reject other currencies, but it will throw an exception if you attempt them
        (
            Xtokens.Multilocation memory asset, 
            Xtokens.Multilocation memory destination,
            uint64 weight
        ) = abi.decode(payload, (Xtokens.Multilocation,Xtokens.Multilocation,uint64));

        // Axelar takes a fee, so expect decoded _amount to be greater than the input "amount"
        // We will be using "amount" instead, since that's what we're actually working with
        wrapAndSendxUSDC(asset, amount, destination, weight);
    }

    function wrapAndSendxUSDC(
        Xtokens.Multilocation memory asset,
        uint256 amount,
        Xtokens.Multilocation memory destination,
        uint64 weight
    ) public {
        // Approve tokens for wrapping
        aUSDC.approve(address(wrapper), amount);

        // Sanity
        emit aUSDCBalance(aUSDC.balanceOf(address(this)));
        emit MultiassetCall(asset, amount, destination, weight);

        // Wrap tokens
        wrapper.wrap(address(aUSDC), amount);

        // Sanity 2
        emit xUSDCBalance(xUSDC.balanceOf(address(this)));

        // Send via XTokens precompile
        try xt.transfer_multiasset(asset, amount, destination, weight) {}
        catch (bytes memory lowLevelData) {
            emit MultiassetError(lowLevelData);
        }
    }

    function sendBackAndSelfDestruct() external {
        aUSDC.transfer(msg.sender, aUSDC.balanceOf(address(this)));
        xUSDC.transfer(msg.sender, xUSDC.balanceOf(address(this)));
        selfdestruct(payable(msg.sender));
    }
}

// Fantom Testnet: 0xc336fe98cce00483c1253f65350D28F8E4fEf1cb
contract SendCrossChainXToken {
    
    IAxelarGateway public gateway;
    IAxelarGasService public constant gasService = IAxelarGasService(0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6);

    constructor(address _gateway) {
        gateway = IAxelarGateway(_gateway);
    }

    // 1. User must approve contract to take USDC
    // 2. User calls this function
    function sendxUSDCToParachain(
        Xtokens.Multilocation memory asset,
        uint256 amount,
        Xtokens.Multilocation memory destination,
        uint64 weight,
        string calldata destinationAddress
    ) public payable {
        // Get USDC token from gateway, transfer from msg.sender
        // msg.sender must approve beforehand
        string memory symbol = "aUSDC";
        IERC20 usdc = IERC20(gateway.tokenAddresses(symbol));
        usdc.transferFrom(msg.sender, address(this), amount);

        // Encode payload
        bytes memory payload = abi.encode(asset, destination, weight);
        
        // Pay for gas (263251366000000 FTM wei)
        gasService.payNativeGasForContractCallWithToken{ value: msg.value }(
            address(this),
            "Moonbeam",
            destinationAddress,
            payload,
            symbol,
            amount,
            msg.sender
        );

        // Approve gateway + send
        usdc.approve(address(gateway), amount);
        gateway.callContractWithToken("Moonbeam", destinationAddress, payload, symbol, amount);
    }

    function sendBackAndSelfDestruct() external {
        IERC20 usdc = IERC20(gateway.tokenAddresses("aUSDC"));
        usdc.transferFrom(msg.sender, address(this), usdc.balanceOf(address(this)));
        selfdestruct(payable(msg.sender));
    }
}

/*
Input Breakdown (xTokens + sendxUSDCToParachain):

                                        04 (pallet), 24 = 36,   05 + number in hex... Does it need PADDING?
Multilocation X2 memory asset:      [0, ["0x0424", "0x05FD9D0BF45A2947A519A741C4B9E99EB6"]]
uint256 amount:                     350000
                                        00 (pchain) 378 = 888,  03 + erc20addr + 00
Multilocation memory destination:   [1, ["0x0000000378", "0x030394c0edfcca370b20622721985b577850b0eb7500"]]
uint64 weight:                      1000000000

*/
