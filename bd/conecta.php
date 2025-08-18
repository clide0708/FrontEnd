<?php
$servidor = "localhost";
$usuario = "root";
$senha = "";
$banco = "bd_tcc";

$conexao = new mysqli($servidor, $usuario, $senha, $banco);

if ($conexao->connect_errno) {
    echo "Erro na conexão com o Banco de Dados!";
    exit();
}

$sql = "SET NAMES utf8mb4";
mysqli_query($conexao, $sql);
?>