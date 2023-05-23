/*
 Navicat Premium Data Transfer

 Source Server         : GPTC
 Source Server Type    : MySQL
 Source Server Version : 50724
 Source Host           : localhost:3306
 Source Schema         : GPTDatabase

 Target Server Type    : MySQL
 Target Server Version : 50724
 File Encoding         : 65001

 Date: 22/05/2023 15:15:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

use GPTDatabase;

-- ----------------------------
-- Table structure for GPTAdmin
-- ----------------------------
DROP TABLE IF EXISTS `GPTAdmin`;
CREATE TABLE `GPTAdmin` (
  `userid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `nickname` text,
  `reverse` text,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of GPTAdmin
-- ----------------------------
BEGIN;
INSERT INTO `GPTAdmin` VALUES (1, 'jiaqi', 'jiaqi1017', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for GPTAiKey
-- ----------------------------
DROP TABLE IF EXISTS `GPTAiKey`;
CREATE TABLE `GPTAiKey` (
  `aikey` varchar(100) NOT NULL,
  `id` int(64) unsigned NOT NULL AUTO_INCREMENT,
  `begindate` datetime DEFAULT NULL,
  `enddate` datetime DEFAULT NULL,
  `createdate` datetime DEFAULT NULL,
  `keytype` tinyint(2) DEFAULT '0',
  `reverse` varchar(100) DEFAULT NULL,
  `keyname` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aikey` (`aikey`) USING BTREE,
  KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for GPTProductInfo
-- ----------------------------
DROP TABLE IF EXISTS `GPTProductInfo`;
CREATE TABLE `GPTProductInfo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wordnum` int(11) DEFAULT '0',
  `originprice` decimal(10,2) DEFAULT '0.00',
  `nowprice` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `reserve` varchar(255) DEFAULT NULL,
  `needvip` tinyint(2) DEFAULT '0',
  `porder` int(5) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for GPTUserInfo
-- ----------------------------
DROP TABLE IF EXISTS `GPTUserInfo`;
CREATE TABLE `GPTUserInfo` (
  `username` varchar(100) NOT NULL,
  `usagecount` float(255,6) unsigned DEFAULT '0.000000',
  `usecount` float(255,6) unsigned DEFAULT '0.000000',
  `password` text NOT NULL,
  `userid` int(255) unsigned NOT NULL AUTO_INCREMENT,
  `isVip` tinyint(1) DEFAULT '0',
  `openid` varchar(100) DEFAULT NULL,
  `from` tinyint(3) DEFAULT '0',
  `reverse` varchar(100) DEFAULT NULL,
  `vipendday` datetime DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `createtime` datetime DEFAULT NULL,
  PRIMARY KEY (`userid`,`username`) USING BTREE,
  UNIQUE KEY `userid` (`userid`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for GPTUserOrderInfo
-- ----------------------------
DROP TABLE IF EXISTS `GPTUserOrderInfo`;
CREATE TABLE `GPTUserOrderInfo` (
  `id` int(255) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `productid` int(255) DEFAULT NULL,
  `createtime` datetime DEFAULT NULL,
  `orderid` varchar(64) DEFAULT NULL,
  `orderstate` int(8) DEFAULT '0',
  `openid` varchar(100) DEFAULT NULL,
  `orderprice` float(255,4) DEFAULT '0.0000',
  `ordertype` int(8) DEFAULT '0',
  `reverse` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for GPTVisitStatic
-- ----------------------------
DROP TABLE IF EXISTS `GPTVisitStatic`;
CREATE TABLE `GPTVisitStatic` (
  `id` int(255) unsigned NOT NULL AUTO_INCREMENT,
  `visits_count` int(11) DEFAULT NULL,
  `unique_visits` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reverse` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
