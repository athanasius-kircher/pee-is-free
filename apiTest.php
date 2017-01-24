<?php

$toiletteState = rand(0,1);

echo json_encode([
    'toiletIsFree' => $toiletteState
]);