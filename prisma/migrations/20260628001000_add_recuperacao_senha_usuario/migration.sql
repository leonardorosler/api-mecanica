-- AlterTable
ALTER TABLE `usuarios`
    ADD COLUMN `codigoRecuperacao` VARCHAR(191) NULL,
    ADD COLUMN `codigoExpiraEm` DATETIME(3) NULL;
