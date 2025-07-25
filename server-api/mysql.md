<!-- 数据库描述 -->

<!-- 1.先创建数据库 -->

CREATE DATABASE IF NOT EXISTS `server_api_development` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

<!-- 2.创建 Deep Sea 数据表  总共13张表-->
<!-- 博客文章表 -->

CREATE TABLE `articles` (
`id` int NOT NULL AUTO_INCREMENT,
`userId` int DEFAULT NULL,
`title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
`likesCount` int DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`size` float DEFAULT NULL,
`views` int NOT NULL DEFAULT '0',
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 评论表 -->

CREATE TABLE `comments` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
`wallId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`likesCount` int NOT NULL DEFAULT '0',
`commentbackground` text COLLATE utf8mb4_unicode_ci,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 建议与反馈表 -->

CREATE TABLE `feedbacks` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`feedback` text COLLATE utf8mb4_unicode_ci NOT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 点赞文章表 -->

CREATE TABLE `likes` (
`id` int NOT NULL AUTO_INCREMENT,
`userId` int DEFAULT NULL,
`articleId` int DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 点赞评论表 -->

CREATE TABLE `likescomments` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`commentId` int unsigned DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 点赞留言墙表 -->

CREATE TABLE `likeswalls` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`wallsId` int unsigned DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 随笔随记表 -->

CREATE TABLE `notes` (
`id` int NOT NULL AUTO_INCREMENT,
`userId` int DEFAULT NULL,
`title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`size` float DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 摄影图库表 -->

CREATE TABLE `photographies` (
`id` int NOT NULL AUTO_INCREMENT,
`userId` int DEFAULT NULL,
`image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`size` float DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=306 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 举报留言墙表 -->

CREATE TABLE `reports` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`wallId` int unsigned DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- sequelize ORM 模型 -->

CREATE TABLE `sequelizemeta` (
`name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
PRIMARY KEY (`name`),
UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

<!-- 更新与维护表 -->

CREATE TABLE `updates` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 用户表 -->

CREATE TABLE `users` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`nickname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`sex` tinyint DEFAULT '0',
`avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`birthday` datetime DEFAULT NULL,
`introduce` text COLLATE utf8mb4_unicode_ci,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`constellation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`clientFeatureCode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`nicknameColor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '#000000',
`code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`codeExpire` datetime DEFAULT NULL,
`area` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `users_email` (`email`),
UNIQUE KEY `uuid` (`uuid`),
UNIQUE KEY `uuid_2` (`uuid`),
UNIQUE KEY `users_username` (`username`),
UNIQUE KEY `phone` (`phone`),
KEY `users_nickname` (`nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 留言墙表 -->

CREATE TABLE `walls` (
`id` int unsigned NOT NULL AUTO_INCREMENT,
`userId` int unsigned DEFAULT NULL,
`name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`content` text COLLATE utf8mb4_unicode_ci,
`likesCount` int unsigned DEFAULT NULL,
`category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
`createdAt` datetime NOT NULL,
`updatedAt` datetime NOT NULL,
`backgroundColor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '#ffffff',
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<!-- 3.最后一点 -->

在 server_api 里 config 文件夹里修改数据库密码 只需要修改 development 测试和生产不需要目前
