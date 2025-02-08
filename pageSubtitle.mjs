class PageSubtitle {
    subtitles = [
        'No more bets.',
        'Πάμε Τζένη;',
        'Χαχαχα, στο βραστό',
        'Διονύση, πιάσε μια μπύρα',
        'Ρίξε μια ζαριά καλή',
        'Ωωωω, Μπαρμπουτάρες',
        'Φωτο το σκορ στη Μυρσίνη',
        'Όχι καμαρωτός, καμαρώτος',
        'Πιάσε ένα δίγκαλτσο',
        'Κόκκινες αμαζόνες',
        'Kαι τάκα τούκα',
        'Pancakes στο Γαλάτσι',
        'ΜΠΑΡ',
        'Επειδή φώναξε;',
        'Με σέβας.',
        'Κάνε στην άκρη πρόστυχη',
        'ΕΚΕΙΕΙΕΙ!',
        'Έεεεελαααααα',
        'Ο Στράτος ο Καραμάνης δεν είσαι;',
        'Είσαι ο Μαρκάτος;',
        'Μπούφλες στην Αλμπέρτα',
        'Tell me baby, do you recognize me?',
        'Μαύρη αμαζόνα, η αυθεντική, η original',
        'Makes me wish I wore my sailor outfit',
        'Στο κορμί μου σα μπλουζάκι',
        'Σα ναυαγοί, σαν Ροβινσώνες',
        'Λίτσα Γκαβούση',
        'Κουμπάρε, το θέμα θεωρείται λήξαν',
        'Tρώει μπιφτέκι από Everest',
        'Το κουνιστό πλατάνι ultras',
        'Μελτέμι resorts',
        'Ποιός; Ποιός;',
        'Καλά να είσαι Γιαννάκη',
        'Nothing Thrives'
    ]

    getSubtitle() {
        return this.subtitles[Math.floor(Math.random()*this.subtitles.length)]
    }
}

export {PageSubtitle}