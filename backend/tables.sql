-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: 07 مايو 2023 الساعة 13:54
-- إصدار الخادم: 10.6.12-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shubra`
--

-- --------------------------------------------------------

--
-- بنية الجدول `accepted_submissions`
--

CREATE TABLE `accepted_submissions` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `submission_id` mediumint(8) UNSIGNED NOT NULL,
  `interview_date` datetime NOT NULL,
  `interview_location_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `interview_location_url` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `interview_notes` text DEFAULT NULL,
  `accepted_by` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `admins`
--

CREATE TABLE `admins` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `username` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nickname` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'النك نيم حاليا مايشتغل، لكن حط فيه الاسماء.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `interview_locations`
--

CREATE TABLE `interview_locations` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `url` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `jobs`
--

CREATE TABLE `jobs` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `title` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `description` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `icon` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `responsibilities` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `qualifications` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `added_by` smallint(5) UNSIGNED DEFAULT NULL,
  `edited_by` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `job_applications`
--

CREATE TABLE `job_applications` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `job_id` smallint(5) UNSIGNED DEFAULT NULL,
  `job_title` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `start_date` datetime NOT NULL DEFAULT current_timestamp(),
  `closed` tinyint(1) NOT NULL DEFAULT 0,
  `close_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `job_submissions`
--

CREATE TABLE `job_submissions` (
  `id` mediumint(11) UNSIGNED NOT NULL,
  `application_id` int(10) UNSIGNED DEFAULT NULL,
  `application_key` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `ip` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `sex` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `id_number` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `birth_date` date NOT NULL,
  `marital_status` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nationality` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `phone` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `address` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `degree` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `graduate_date` year(4) NOT NULL,
  `gpa` float DEFAULT NULL,
  `field` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`courses`)),
  `experiences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`experiences`)),
  `computer_rate` tinyint(3) UNSIGNED NOT NULL,
  `english_rate` tinyint(3) UNSIGNED NOT NULL,
  `flexibility_rate` tinyint(3) UNSIGNED NOT NULL,
  `self_talk` text NOT NULL,
  `files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`files`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accepted_submissions`
--
ALTER TABLE `accepted_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_id` (`submission_id`),
  ADD KEY `accept_submissions_admin_relation` (`accepted_by`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `interview_locations`
--
ALTER TABLE `interview_locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`title`),
  ADD KEY `jobs-admins_relation` (`added_by`),
  ADD KEY `edited_by` (`edited_by`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_title` (`job_title`),
  ADD KEY `jobs_relation` (`job_id`);

--
-- Indexes for table `job_submissions`
--
ALTER TABLE `job_submissions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accepted_submissions`
--
ALTER TABLE `accepted_submissions`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_locations`
--
ALTER TABLE `interview_locations`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_submissions`
--
ALTER TABLE `job_submissions`
  MODIFY `id` mediumint(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- قيود الجداول المحفوظة
--

--
-- القيود للجدول `accepted_submissions`
--
ALTER TABLE `accepted_submissions`
  ADD CONSTRAINT `accept_submissions_admin_relation` FOREIGN KEY (`accepted_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `accept_submissions_id_relation` FOREIGN KEY (`submission_id`) REFERENCES `job_submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- القيود للجدول `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs-admins_relation` FOREIGN KEY (`added_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`edited_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `jobs_relation` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
