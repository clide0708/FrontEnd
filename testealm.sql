-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 29/07/2025 às 22:29
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
-- Banco de dados: `testealm`
--
CREATE DATABASE IF NOT EXISTS `testealm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `testealm`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_refeicao`
--

CREATE TABLE `itens_refeicao` (
  `id` int(11) NOT NULL,
  `id_tipo_refeicao` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `especificacao` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_refeicao`
--

INSERT INTO `itens_refeicao` (`id`, `id_tipo_refeicao`, `nome`, `especificacao`) VALUES
(28, 1, 'carrot', '100'),
(30, 2, 'carrot', '100'),
(31, 1, 'potato', '500'),
(32, 3, 'potato', '100');

-- --------------------------------------------------------

--
-- Estrutura para tabela `nutrientes`
--

CREATE TABLE `nutrientes` (
  `id` int(11) NOT NULL,
  `alimento_id` int(11) NOT NULL,
  `calorias` decimal(10,2) DEFAULT 0.00,
  `proteinas` decimal(10,2) DEFAULT 0.00,
  `carboidratos` decimal(10,2) DEFAULT 0.00,
  `gorduras` decimal(10,2) DEFAULT 0.00,
  `unidade` varchar(20) DEFAULT 'g'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `nutrientes`
--

INSERT INTO `nutrientes` (`id`, `alimento_id`, `calorias`, `proteinas`, `carboidratos`, `gorduras`, `unidade`) VALUES
(29, 28, 41.00, 0.93, 9.58, 0.24, 'g'),
(31, 30, 41.00, 0.93, 9.58, 0.24, 'g'),
(32, 31, 385.00, 10.10, 87.35, 0.45, 'g'),
(33, 32, 77.00, 2.02, 17.47, 0.09, 'g');

-- --------------------------------------------------------

--
-- Estrutura para tabela `refeicoes_tipos`
--

CREATE TABLE `refeicoes_tipos` (
  `id` int(11) NOT NULL,
  `nome_tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `refeicoes_tipos`
--

INSERT INTO `refeicoes_tipos` (`id`, `nome_tipo`) VALUES
(2, 'almoco'),
(1, 'cafe'),
(3, 'janta'),
(4, 'outros');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `itens_refeicao`
--
ALTER TABLE `itens_refeicao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_tipo_refeicao` (`id_tipo_refeicao`);

--
-- Índices de tabela `nutrientes`
--
ALTER TABLE `nutrientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `alimento_id` (`alimento_id`);

--
-- Índices de tabela `refeicoes_tipos`
--
ALTER TABLE `refeicoes_tipos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome_tipo` (`nome_tipo`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `itens_refeicao`
--
ALTER TABLE `itens_refeicao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de tabela `nutrientes`
--
ALTER TABLE `nutrientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de tabela `refeicoes_tipos`
--
ALTER TABLE `refeicoes_tipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `itens_refeicao`
--
ALTER TABLE `itens_refeicao`
  ADD CONSTRAINT `itens_refeicao_ibfk_1` FOREIGN KEY (`id_tipo_refeicao`) REFERENCES `refeicoes_tipos` (`id`);

--
-- Restrições para tabelas `nutrientes`
--
ALTER TABLE `nutrientes`
  ADD CONSTRAINT `nutrientes_ibfk_1` FOREIGN KEY (`alimento_id`) REFERENCES `itens_refeicao` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
