const { ethers } = require("hardhat");

// Адресът на разположения договор
// Уверете се, че този адрес е коректният:
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; 

// Брой токени за минтване (Вече като BigInt за по-лесно сравнение)
const MINT_QUANTITY_BIGINT = 10n; // Използвайте 'n' за BigInt в JavaScript

async function main() {
    // 1. Вземане на акаунта, който ще извърши транзакцията
    const [deployer] = await ethers.getSigners();
    console.log(`\nМинтване на ${MINT_QUANTITY_BIGINT.toString()} токена към адрес: ${deployer.address}`);

    // 2. Вземане на инстанцията на договора
    const Kotkata = await ethers.getContractFactory("Kotkata");
    const kotkata = Kotkata.attach(CONTRACT_ADDRESS);

    // 3. Проверка на останалата наличност
    const remainingSupply = await kotkata.remainingSupply();
    
    // КОРЕКЦИЯ: Сравняваме BigInt с BigInt или използваме standard JS сравнение
    // remainingSupply вече е стандартен BigInt (native JS BigInt)
    
    if (remainingSupply < MINT_QUANTITY_BIGINT) { 
        console.error(`Грешка: Недостатъчно наличност. Остават само ${remainingSupply.toString()} токена.`);
        return;
    }

    // 4. Извикване на batchMint функцията
    console.log(`Извикване на batchMint за ${MINT_QUANTITY_BIGINT.toString()} NFT...`);
    
    const tx = await kotkata.batchMint(deployer.address, MINT_QUANTITY_BIGINT);
    const receipt = await tx.wait();

    // 5. Показване на резултата
    // TotalMinted() също ще върне BigInt.
    const totalMinted = await kotkata.totalMinted();
    const startTokenId = totalMinted - MINT_QUANTITY_BIGINT; // Използваме BigInt аритметика

    console.log("-----------------------------------------");
    console.log("✅ Успешно минтване!");
    console.log(`Транзакция Hash: ${receipt.hash}`);
    console.log(`Минтирани токени (ID): от ${startTokenId.toString()} до ${(totalMinted - 1n).toString()}`);
    console.log(`Общо минтирани токени: ${totalMinted.toString()}`);
    console.log(`Останала наличност: ${await kotkata.remainingSupply()}`);
    console.log("-----------------------------------------");

    // 6. Проверка на tokenURI
    const firstTokenId = startTokenId;
    const tokenURI = await kotkata.tokenURI(firstTokenId);
    console.log(`Проверка на метадата за Токен ID ${firstTokenId}:`);
    console.log(`Token URI: ${tokenURI}`);
    console.log(`(Проверете този URI в браузъра си, за да видите JSON файла.)`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

