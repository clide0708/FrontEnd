<?php
class TesteController
{
    public function index()
    {
        header('Content-Type: application/json');
        echo json_encode(["mensagem" => "Deu certo!!"]);
    }
}
