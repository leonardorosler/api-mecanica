-- CreateTable
CREATE TABLE `mecanicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `especialidade` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mecanicos_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_peca` VARCHAR(191) NOT NULL,
    `qtd_estoque` INTEGER NOT NULL,
    `preco_venda` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consertos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `carro_modelo` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mecanicoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_conserto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consertoId` INTEGER NOT NULL,
    `pecaId` INTEGER NOT NULL,
    `quant_usada` INTEGER NOT NULL,
    `preco_unit` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consertos` ADD CONSTRAINT `consertos_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `mecanicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_conserto` ADD CONSTRAINT `itens_conserto_consertoId_fkey` FOREIGN KEY (`consertoId`) REFERENCES `consertos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_conserto` ADD CONSTRAINT `itens_conserto_pecaId_fkey` FOREIGN KEY (`pecaId`) REFERENCES `pecas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
