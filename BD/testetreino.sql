-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11/08/2025 às 04:58
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `testetreino`
--
CREATE DATABASE IF NOT EXISTS `testetreino` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `testetreino`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `exercicios`
--

CREATE TABLE `exercicios` (
  `id` int(11) NOT NULL,
  `treino_id` int(11) DEFAULT NULL,
  `num_series` int(11) DEFAULT NULL,
  `num_repeticoes` int(11) DEFAULT NULL,
  `tempo_descanso` int(11) DEFAULT NULL,
  `peso` int(11) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `informacoes` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `cover` varchar(255) NOT NULL,
  `grupo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `exercicios`
--

INSERT INTO `exercicios` (`id`, `treino_id`, `num_series`, `num_repeticoes`, `tempo_descanso`, `peso`, `nome`, `informacoes`, `url`, `cover`, `grupo`) VALUES
(23, 15, 12, 32, 12, 12, 'Supino inclinado', 'não sei oq não sei oq la', 'https://youtu.be/mw1yg6pXrMI?si=3YgMGFZgyU-ZFUNT', 'https://www.correiobraziliense.com.br/cbradar/wp-content/uploads/2025/02/taylor-swift_1740080880193.jpg', 'peitoral'),
(24, 13, 3, 12, 20, 12, 'Teste2', 'não sei oq não sei oq la', 'https://www.youtube.com/watch?v=SynewkIgEa4', 'https://pbs.twimg.com/profile_images/1876765399687049216/kLaAM_SN_400x400.jpg', 'abdomen'),
(25, 13, 3, 12, 23, 12, 'Supino inclinado', 'não sei oq não sei oq la', 'https://youtu.be/mw1yg6pXrMI?si=3YgMGFZgyU-ZFUNT', 'https://www.correiobraziliense.com.br/cbradar/wp-content/uploads/2025/02/taylor-swift_1740080880193.jpg', 'peitoral');

-- --------------------------------------------------------

--
-- Estrutura para tabela `treinos`
--

CREATE TABLE `treinos` (
  `id` int(11) NOT NULL,
  `nome` text NOT NULL,
  `data_ultima_modificacao` date DEFAULT NULL,
  `especialidades` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `treinos`
--

INSERT INTO `treinos` (`id`, `nome`, `data_ultima_modificacao`, `especialidades`) VALUES
(13, 'teste2', '2025-08-09', ''),
(15, 'teste5', '2025-08-09', '213');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `exercicios`
--
ALTER TABLE `exercicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treino_id` (`treino_id`);

--
-- Índices de tabela `treinos`
--
ALTER TABLE `treinos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `exercicios`
--
ALTER TABLE `exercicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `treinos`
--
ALTER TABLE `treinos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `exercicios`
--
ALTER TABLE `exercicios`
  ADD CONSTRAINT `exercicios_ibfk_1` FOREIGN KEY (`treino_id`) REFERENCES `treinos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
