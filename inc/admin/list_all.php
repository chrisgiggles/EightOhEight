<?php
include_once('../options.php');
include_once('../db_connect.php');
include_once('../functions.php');

$page = isset($_GET['page']) ? $_GET['page'] : 1;
$items_per_page = 20;
$offset = ($page - 1) * $items_per_page;

try {
    $query = "select * from tracks order by created DESC limit :offset, :items_per_page";
    $ps = $db->prepare($query);
    $ps->bindValue('offset', $offset, PDO::PARAM_INT);
    $ps->bindValue('items_per_page', $items_per_page, PDO::PARAM_INT);
    $ps->execute();
    $tracks = $ps->fetchAll(PDO::FETCH_ASSOC);
}
catch( Exception $e ) {
    echo $e->getMessage();
}

?>

<?php foreach ($tracks as $track): ?>
    <ul>
        <li>
            <?= $track['artist'] ?> - <?= $track['title'] ?> 
            <a href="index.php?p=edit_track&id=<?= $track['id'] ?>">Edit</a>
        </li>
    </ul>
<?php endforeach; ?>
