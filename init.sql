/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 50724
 Source Host           : localhost:3306
 Source Schema         : GPTDatabase

 Target Server Type    : MySQL
 Target Server Version : 50724
 File Encoding         : 65001

 Date: 26/04/2023 15:36:08
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
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of GPTAdmin
-- ----------------------------
BEGIN;
INSERT INTO `GPTAdmin` VALUES (1, 'jiaqi', 'jiaqi1017');
COMMIT;

-- ----------------------------
-- Table structure for GPTUserInfo
-- ----------------------------
DROP TABLE IF EXISTS `GPTUserInfo`;
CREATE TABLE `GPTUserInfo` (
  `username` varchar(100) NOT NULL,
  `usagecount` int(255) unsigned DEFAULT '0',
  `usecount` int(255) unsigned DEFAULT '0',
  `password` text NOT NULL,
  `userid` int(255) unsigned NOT NULL AUTO_INCREMENT,
  `usageword` bigint(255) DEFAULT '0',
  `useword` float(255,6) DEFAULT '0.000000',
  PRIMARY KEY (`userid`,`username`) USING BTREE,
  UNIQUE KEY `userid` (`userid`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
