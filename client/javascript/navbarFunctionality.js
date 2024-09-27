document.addEventListener('DOMContentLoaded', function() {
    const moreButton = document.getElementById('moreButton');
    const moreMenu = document.getElementById('moreMenu');
    const closeMoreMenu = document.getElementById('closeMoreMenu');
    const moreMenuContent = moreMenu.querySelector('div');

    function openMenu() {
        moreMenu.classList.remove('hidden');
        setTimeout(() => {
            moreMenuContent.classList.remove('translate-y-full');
        }, 10);
    }

    function closeMenu() {
        moreMenuContent.classList.add('translate-y-full');
        setTimeout(() => {
            moreMenu.classList.add('hidden');
        }, 300);
    }

    moreButton.addEventListener('click', openMenu);
    closeMoreMenu.addEventListener('click', closeMenu);

    // Close menu when clicking outside
    moreMenu.addEventListener('click', function(event) {
        if (event.target === moreMenu) {
            closeMenu();
        }
    });
});