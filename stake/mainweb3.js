message("Welcome!", "Welcome to raredogecoin.com", "success")

window.perfectDefiBoosterAddress = '0x7907d9640949c298E30A25bFaF3dE31424A98A7e';
//0x7e1B7DA47F3d9A4A36aC89921479163E89296E34 : testnet
//0x7907d9640949c298E30A25bFaF3dE31424A98A7e : mainnet
window.perfectDefiAddress = '0x336A11EED698c85B9cEf50c91A83764A674F20cA';
//0x7F9827556636e4eD963aA40ec14C75bbf88c172d : testnet
//0x336A11EED698c85B9cEf50c91A83764A674F20cA : mainnet

let perfectDefiBoosterContract

let perfectDefiContract

let loop = false

// Chosen wallet provider given by the dialog window
let provider;

let currentNet = 'mainnet';
let currentChainId = null;

// Address of the selected account
window.userAddr = null;

async function initProviders() {
    if (typeof provider !== 'undefined') {
        web3 = new Web3(provider);
    } else if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // mainnet
        const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
        // testnet
        // web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
    }

    await connectWeb3();
}

async function fetchAccountData() {
    window.web3 = new Web3(provider);

    network = await web3.eth.net.getId();

    window.chainId = network.toString();

    const accounts = await web3.eth.getAccounts();

    userAddr = accounts[0];

    $("#prepare").hide()
    $("#connected").show()

    return userAddr;
}

async function refreshAccountData() {
    $("#connected").hide()
    $("#prepare").show()

    // Disable button while UI is loading.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
    $("#ethwallet").val(userAddr)
}

async function onConnect() {
    await provider.enable();

    await fetchAccountData();
}

async function onDisconnect() {
    loop = false

    if (provider.close) {
        await provider.close();

        provider = null;
    }

    userAddr = null;

    // Set the UI back to the initial state
    $("#prepare").show()
    $("#connected").hide()
}

$('#btn-connect').click(async () => {
    if (!provider) {
        $("#providerModal").modal('show');
    }
});

$('#connectToMetamask').click(async () => {
    if (window.ethereum && window.ethereum.isConnected()) {
        provider = window.ethereum;
        web3 = new Web3(provider);

        await connectWeb3();
        $("#providerModal").modal('hide');
    }
});

$('#connectToBinance').click(async () => {
    if (window.BinanceChain) {
        const isConnected = await window.BinanceChain.isConnected();
        if (isConnected) {
            provider = window.BinanceChain;
            web3 = new Web3(provider);
        }

        await connectWeb3();
        $("#providerModal").modal('hide');
    }
});

async function connectWeb3() {
    var network = 0;

    if (web3) {
        network = await web3.eth.net.getId();
        currentChainId = network.toString();

        switch (currentChainId) {
            case "56":
                network = 'mainnet';
                break;
            case "97":
                network = 'testnet';
                break;
            default:
                console.log('This is an unknown network.');
        }

        if (network.toLowerCase() !== currentNet.toLowerCase()) {
            message("Please connect your Wallet to " + currentNet + ' network', "Warning", "warning")
            return false;
        } else {
            if (typeof provider !== 'undefined') {
                provider.enable().then(function () {
                    getWeb3Accounts();
                });
            } else {
                getWeb3Accounts();
            }
        }
    }
}

function getWeb3Accounts() {
    web3.eth.getAccounts(async function (err, accounts) {
        if (err) 
            message(err + '. Are you sure you are on a secure (SSL / HTTPS) connection?', "Warning", "warning")
        if (accounts.length > 0) {
            address = accounts[0];
            var isAddress = web3.utils.isAddress(address);

            if (isAddress) {
                web3.eth.defaultAccount = accounts[0];
                userAddr = web3.eth.defaultAccount;

                $("#prepare").hide()
                $("#connected").show()
                await setupContracts()
                await updateData();
            }
        } else {

            message("Please connect to your Web3 provider!", "Warning", "warning")
        }
    });
}

/* ------------------------------ */

async function isConnectedFunc() {
    const connected = !!window.provider

    if (userAddr) {
        return true;
    }
    try {
        const accounts = await web3.eth.getAccounts();
        return (Array.isArray(accounts) && accounts.length > 0)
    } catch (err) {
        console.error(err)
        return false
    }
}

async function init() {
    setTimeout(() => {
        $('#btn-connect').css('opacity', 1);
    }, 1000)
    setTimeout(() => {
        $('.uniswap-link').attr('href', uniswapUrl())
    }, 0)

    initProviders()

    if (await isConnectedFunc()) {
        await afterConnect()
    } else {
        await afterConnect()
    }

}

window.addEventListener('load', init);



async function afterConnect() {
    // Subscribe to accounts change
    provider.on("accountsChanged", async (accounts) => {
        if (!await fetchAccountData()) {
            await onDisconnect()
        }
    });
    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId) => {
        if (!await fetchAccountData()) {
            await onDisconnect()
        }
    });
    // Subscribe to networkId change
    provider.on("networkChanged", async (networkId) => {
        if (!await fetchAccountData()) {
            await onDisconnect()
        }
    });
    await refreshAccountData();

    loop = true
    await interfaceLoop()
    updateLiveEvents()
    fastLoop()
}

async function setupContracts() {
    try {
        perfectDefiContract= await new web3.eth.Contract(abis[perfectDefiAddress], perfectDefiAddress)
        perfectDefiBoosterContract = await new web3.eth.Contract(abis[perfectDefiBoosterAddress], perfectDefiBoosterAddress)
    } catch (error) {
        console.error(error)
    }
}


function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatTokens(num) {
    return addCommas((num / 1e18).toFixed(2)) + " RD"
}


let bnbUsd = 313
let res

function formatDollas(amount) {
    if (amount < 0) {
        return '-$' + addCommas((Math.abs(amount)).toFixed(3))
    }
    return '~$' + addCommas((amount).toFixed(3))
}

function formatD(amount) {
    return ' ($' + addCommas((amount).toFixed(0)) + ' USD)'
}


function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var PDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + PDisplay + sDisplay;
}

function uniswapUrl() {
    return `https://app.uniswap.org/#/swap?outputCurrency=${window.contractAddress}`
}


async function updateBnbUsd() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=USD')
        const json = await res.json()
        bnbUsd = json.binancecoin.usd
    } catch (err) {
        console.error(err)
    }
}

async function stakes() {
    let amount = checkValidStakeAmount();
    if(amount) {
        const urlParams = new URLSearchParams(window.location.search);
        const referer = urlParams.get('ref');

        if (provider) {
            perfectDefiContract.methods.approve(perfectDefiAddress, web3.utils.toWei(amount)).send({from: userAddr})
            .on('confirmation', function (confirmationNumber, receipt) {
                if (confirmationNumber === 2) {
                    perfectDefiContract.methods.stake(web3.utils.toWei(amount), referer ? referer * 1.0 : 0).send({
                        from: userAddr
                    })
                    .on('confirmation',async function (confirmation, receipt) {
                        if (confirmation === 2) {
                            message('Successfully staked amount : ' + amount + ' RD', "Success", "success");
                            await updateData();
                        }
                    })
                    .on('error', function (error) {
                        message('Error : ' + error, "Warning", "warning")
                    })
                }
            })
            .on('error', function (error) {
                message('Error : ' + error, "Warning", "warning")
            })

            
        } else {
            message("Please connect your wallet", "Warning", "warning")
        }
    }
}

async function reinvest(stakeIndex) {
    await perfectDefiContract.methods.reinvest(stakeIndex).send({
        from: userAddr,
        value: 0
    }).on('confirmation', async function (confirmation, receipt) {
        if (confirmation === 2) {
            message("Successfully reinvested your stake", "Success", "success")
            await updateData();
        }
    })
    .on('error', function (error) {
        message('Error : ' + error, "Error", "warning")
    })
}

function checkValidStakeAmount() {
    let amount = $("#rdstakes").val();
    if (amount <= 0 || !isFinite(amount) || amount === '') {
        message("Input valid amount", "Warning", "warning")
        return false;
    } else {
        return amount;
    }
}

async function createRefCode() {
    await perfectDefiContract.methods.createRefCode().send({
        from: userAddr,
        value: 0
    }).on('confirmation', async function (confirmation, receipt) {
        if (confirmation === 2) {
            message("Successfully created your Ref Code", "Success", "success")

            let refCode = await perfectDefiContract.methods.refCode(userAddr).call();
            $("#yourrefferal").val(refCode);
        }
    })
    .on('error', function (error) {
        message('Error : ' + error, "Error", "warning")
    })
}

async function claim(stakeIndex) {
    await perfectDefiContract.methods.claim(stakeIndex).send({
        from: userAddr,
        value: 0
    }).on('confirmation', async function (confirmation, receipt) {
        if (confirmation === 2) {
            message("Successfully claimed your reward", "Success", "success");
            await updateData();
        }
    })
    .on('error', function (error) {
        message('Error : ' + error, "Error", "warning")
    })
}

async function increaseRate() {
    let rateAmount = $("#rateAmount").val();
    let stakeIndex = $("#stakeIndex").val();
    let stakeNumber = await perfectDefiContract.methods.stakeNumber(userAddr).call();
    
    if (rateAmount <= 0 || !isFinite(rateAmount) || rateAmount === '') {
        message("Input valid BNB amount", "Warning", "warning")
        return ;
    }

    if (stakeIndex <= 0 || !isFinite(stakeIndex) || stakeIndex === '' || stakeIndex*1.0  > stakeNumber*1.0) {
        message("Input valid stake index", "Warning", "warning")
        return ;
    }

    let stakeData = await perfectDefiContract.methods.stakes(userAddr, stakeIndex*1.0 - 1).call();
    let bonusRate = stakeData.bonusRate;

    if((bonusRate + rateAmount*10) >= 20) {
        message("Amount Exceeds Max Rate", "Warning", "warning")
    } else {
        let bnbAmount = rateAmount*10*0.05*10**18;

        await perfectDefiContract.methods.increaseRate(rateAmount*10, stakeIndex*1.0 - 1).send({
            from: userAddr,
            value: bnbAmount
        }).on('confirmation', async function (confirmation, receipt) {
            if (confirmation === 2) {
                message("Successfully increased your bonus rate", "Success", "success");
                await updateData();
            }
        })
        .on('error', function (error) {
            message('Error : ' + error, "Error", "warning")
        })
    }
}

async function useBooster() {
    let stakeIndexToBoost = $("#stakeIndexToBoost").val();
    let stakeNumber = await perfectDefiContract.methods.stakeNumber(userAddr).call();

    if (stakeIndexToBoost <= 0 || !isFinite(stakeIndexToBoost) || stakeIndexToBoost === '' || stakeIndexToBoost*1.0  > stakeIndexToBoost*1.0) {
        message("Input valid stake index", "Warning", "warning")
        return ;
    }

    let userPDBBl = await perfectDefiBoosterContract.methods.balanceOf(userAddr).call();
    if((web3.utils.fromWei(userPDBBl.toString()) * 1.0) < 1) {
        message("Not enough DB balance", "Warning", "warning")
        return ;
    }

    await perfectDefiBoosterAddress.methods.approve(perfectDefiAddress, web3.utils.toWei(1)).send({from: userAddr})
    .on('confirmation',async function (confirmationNumber, receipt) {
        if (confirmationNumber === 2) {
            await perfectDefiContract.methods.useBooster(stakeIndex*1.0 - 1).send({
                from: userAddr,
                value: 0
            }).on('confirmation', async function (confirmation, receipt) {
                if (confirmation === 2) {
                    message("Successfully increased your bonus rate by using 1 DB", "Success", "success");
                    await updateData();
                }
            })
            .on('error', function (error) {
                message('Error : ' + error, "Error", "warning")
            })
        }
    }).on('error', function (error) {
        message('Error : ' + error, "Warning", "warning")
    });
    
}

async function updateData() { 
    let totalSupply = await perfectDefiContract.methods.totalSupply().call();
    $("#totalSupply").text((web3.utils.fromWei(totalSupply.toString()) * 1.0).toFixed(4));

    let userBalance = await perfectDefiContract.methods.balanceOf(userAddr).call();
    $("#userBl").text((web3.utils.fromWei(userBalance.toString()) * 1.0).toFixed(4));

    let totalPDBSupply = await perfectDefiBoosterContract.methods.totalSupply().call();
    $("#totalDBSupply").text((web3.utils.fromWei(totalPDBSupply.toString()) * 1.0).toFixed(4));

    let userPDBBl = await perfectDefiBoosterContract.methods.balanceOf(userAddr).call();
    $("#userDBBl").text((web3.utils.fromWei(userPDBBl.toString()) * 1.0).toFixed(4));

    let myRef = await perfectDefiContract.methods.myRef(userAddr).call();
    if(myRef*1.0 > 0) {
        $("#refferal").val(myRef);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const referer = urlParams.get('ref');
        $("#refferal").val(referer?referer*1.0:0);
    
    }

    let refCode = await perfectDefiContract.methods.refCode(userAddr).call();
    $("#yourrefferal").val("0x" + (refCode*1.0).toString(16));

    await updateStakesTable();

    dataTimer = setTimeout(async function () {
        await updateData()
    }, 1000)
}

async function updateStakesTable() {
    let stakeNumber = await perfectDefiContract.methods.stakeNumber(userAddr).call();
    if(stakeNumber*1.0 > 0) {
        stakeNumber = stakeNumber*1.0;
        $("#stakeNumber").text(stakeNumber);
        let tableHtml = "";
        let totalStaked = 0;
        for(let i = 0; i < stakeNumber; i++) {
            let stakedData = await perfectDefiContract.methods.stakes(userAddr, i).call();
            let claimAmount = await perfectDefiContract.methods.calcClaim(userAddr, i).call();
            totalStaked = totalStaked + web3.utils.fromWei(stakedData.amount, "ether") * 1.0;
            tableHtml = tableHtml + `<tr>
                <td>${i+1}</td>
                <td>${(web3.utils.fromWei(stakedData.amount, "ether") * 1.0).toFixed(8)} RD</td>
                <td>${(web3.utils.fromWei(claimAmount, "ether") * 1.0).toFixed(8)} RD</td>
                <td>${(web3.utils.fromWei(stakedData.claimed, "ether") * 1.0).toFixed(8)} RD</td>
                <td>${stakedData.bonusRate / 10} %</td>
                <td>${new Date(stakedData.stakeTime*1000).toLocaleDateString()}</td>
                <td>
                <button class="btn btn-block btn-info btn-sm" onclick="claim(${i})">
                    Claim
                </button>
                <button class="btn btn-block btn-success btn-sm" onclick="reinvest(${i})">
                    Reinvest
                </button>
                </td>
            </tr>`;
        }

        $("#stakess").html(tableHtml);
        $("#userTotalDep").text(totalStaked.toFixed(4));
    }
}


function counterHack(news, idss) {
    var old = $(idss).text()

    if (old != news) {
        $(idss).text(news)
        $(idss).counterUp({
            delay: 10,
            time: 1000
        });
    }
}

function message(texts, titles, type) {
    type==="success" &&
    toastr.success(texts, titles, {
        timeOut: 0,
        closeButton: !0,
        debug: !1,
        newestOnTop: !0,
        progressBar: !0,
        positionClass: "toast-bottom-right demo_rtl_class",
        preventDuplicates: !0,
        onclick: null,
        showDuration: "0",
        hideDuration: "0",
        extendedTimeOut: "0",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
        tapToDismiss: !1,
        closeHtml: '<button><i class="ti-close"></i></button>'
    });

    type==="warning" && 
    toastr.warning(texts, titles, {
        timeOut: 0,
        closeButton: !0,
        debug: !1,
        newestOnTop: !0,
        progressBar: !0,
        positionClass: "toast-bottom-right demo_rtl_class",
        preventDuplicates: !0,
        onclick: null,
        showDuration: "0",
        hideDuration: "0",
        extendedTimeOut: "0",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
        tapToDismiss: !1,
        closeHtml: '<button><i class="ti-close"></i></button>'
    });
}