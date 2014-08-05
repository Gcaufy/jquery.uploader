<?php 
if (isset($_POST['id']) && $_POST['ext']) {
    $id = $_POST['id'];
    $ext = $_POST['ext'];
    $name = dirname(__FILE__) . '\\' . $id . '.' . $ext;
    unlink($name);
    echo 1;
}
echo 0;
