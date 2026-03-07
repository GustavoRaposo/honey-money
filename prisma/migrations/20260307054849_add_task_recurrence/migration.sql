-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `is_recurrent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `parent_task_id` INTEGER NULL,
    ADD COLUMN `recurrence_days` VARCHAR(191) NULL,
    ADD COLUMN `recurrence_duration` VARCHAR(191) NULL,
    ADD COLUMN `recurrence_time` VARCHAR(191) NULL,
    ADD COLUMN `recurrence_type` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_parent_task_id_fkey` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
