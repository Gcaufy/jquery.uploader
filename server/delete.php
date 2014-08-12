<?php 
if (isset($_POST['id']) && $_POST['ext']) {
    $id = $_POST['id'];
    $ext = $_POST['ext'];
    $name = dirname(__FILE__) . DIRECTORY_SEPARATOR . $id . '.' . $ext;
    
    /// For SAE only
    if (class_exists('SaeStorage')) {
        $name = 'uploads' . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . $id . '.' . $ext;
        $storage = new SaeStorage();
        $storage->delete("img", $name);
    } else {
    	unlink($name);
    }
    echo 1;
    exit;
}
echo 0;
exit;
