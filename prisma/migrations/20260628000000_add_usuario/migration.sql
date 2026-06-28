-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `nivel` INTEGER NOT NULL DEFAULT 1,
    `ultimoLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `consertos` ADD COLUMN `usuarioId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `consertos` ADD CONSTRAINT `consertos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
