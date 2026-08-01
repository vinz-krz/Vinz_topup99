// Database Dummy untuk Produk & Nominal Item
const productData = {
    "Free Fire": [
        { name: "70 Diamonds", price: 10000 },
        { name: "140 Diamonds", price: 20000 },
        { name: "355 Diamonds", price: 50000 },
        { name: "720 Diamonds", price: 100000 },
        { name: "1450 Diamonds", price: 200000 },
        { name: "2180 Diamonds", price: 300000 }
    ],
    "FC Mobile": [
        { name: "100 FC Points", price: 15000 },
        { name: "310 FC Points", price: 45000 },
        { name: "520 FC Points", price: 75000 },
        { name: "1050 FC Points", price: 150000 }
    ],
    "PUBG Mobile": [
        { name: "60 UC", price: 15000 },
        { name: "325 UC", price: 75000 },
        { name: "660 UC", price: 150000 },
        { name: "1800 UC", price: 375000 }
    ],
    "Mobile Legends": [
        { name: "86 Diamonds", price: 20000 },
        { name: "172 Diamonds", price: 40000 },
        { name: "257 Diamonds", price: 60000 },
        { name: "706 Diamonds", price: 150000 },
        { name: "2195 Diamonds", price: 450000 }
    ],
    "Roblox": [
        { name: "400 Robux", price: 65000 },
        { name: "800 Robux", price: 130000 },
        { name: "1700 Robux", price: 260000 },
        { name: "4500 Robux", price: 650000 }
    ],
    "Token Listrik PLN": [
        { name: "Token PLN Rp 20.000", price: 21500 },
        { name: "Token PLN Rp 50.000", price: 51500 },
        { name: "Token PLN Rp 100.000", price: 101500 },
        { name: "Token PLN Rp 200.000", price: 201500 }
    ],
    "Pulsa & Paket Data": [
        { name: "Pulsa 25.000", price: 26000 },
        { name: "Pulsa 50.000", price: 51000 },
        { name: "Paket Data 5GB (3 Hari)", price: 25000 },
        { name: "Paket Data 15GB (30 Hari)", price: 75000 }
    ]
};

// Global Transaction State
let currentTransaction = {
    productName: "",
    productType: "",
    userId: "",
    serverId: "",
    selectedItemName: "",
    selectedItemPrice: 0,
    paymentMethod: ""
};

// Fungsi Navigasi Antar Halaman (1 sampai 5)
function goToPage(pageNumber) {
    // Sembunyikan semua halaman
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Tampilkan halaman tujuan
    const targetPage = document.getElementById(`page-${pageNumber}`);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Fungsi ketika produk dipilih di Halaman 1 -> Pindah ke Halaman 2
function selectProduct(productName, type) {
    currentTransaction.productName = productName;
    currentTransaction.productType = type;

    // Update Header di Halaman 2
    document.getElementById('display-product-name').innerText = productName;

    // Atur visibilitas Server ID (Game perlu, PPOB tidak butuh zone ID)
    const serverGroup = document.getElementById('server-group');
    const userIdInput = document.getElementById('user-id-input');
    
    if (type === 'ppob') {
        serverGroup.style.display = 'none';
        if (productName.includes('Token')) {
            userIdInput.placeholder = "Nomor Meter / ID Pelanggan";
        } else {
            userIdInput.placeholder = "Nomor HP (Contoh: 08123456789)";
        }
    } else {
        serverGroup.style.display = 'flex';
        userIdInput.placeholder = "Contoh: 12345678";
    }

    // Load Nominal Item sesuai produk
    renderNominalList(productName);

    // Pindah ke Halaman 2
    goToPage(2);
}

// Render daftar pilihan nominal item
function renderNominalList(productName) {
    const nominalListContainer = document.getElementById('nominal-list');
    nominalListContainer.innerHTML = '';

    const items = productData[productName] || [];

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `nominal-card ${index === 0 ? 'selected' : ''}`;
        card.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">Rp ${item.price.toLocaleString('id-ID')}</span>
        `;

        // Set default item pertama yang terpilih
        if (index === 0) {
            currentTransaction.selectedItemName = item.name;
            currentTransaction.selectedItemPrice = item.price;
        }

        // Event klik untuk memilih nominal
        card.onclick = () => {
            document.querySelectorAll('.nominal-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            currentTransaction.selectedItemName = item.name;
            currentTransaction.selectedItemPrice = item.price;
        };

        nominalListContainer.appendChild(card);
    });
}

// Validasi input dari Halaman 2 -> Lanjut ke Halaman 3 (Pembayaran)
function proceedToPayment() {
    const userId = document.getElementById('user-id-input').value.trim();
    const serverId = document.getElementById('server-id-input').value.trim();

    if (!userId) {
        alert("Harap masukkan ID User / Nomor Tujuan terlebih dahulu!");
        return;
    }

    if (currentTransaction.productType === 'game' && !serverId && document.getElementById('server-group').style.display !== 'none') {
        alert("Harap masukkan Server / Zone ID game Anda!");
        return;
    }

    currentTransaction.userId = userId;
    currentTransaction.serverId = serverId;

    // Update Ringkasan Pesanan di Halaman 3
    document.getElementById('sum-product').innerText = currentTransaction.productName;
    document.getElementById('sum-item').innerText = currentTransaction.selectedItemName;
    
    let targetText = currentTransaction.userId;
    if (currentTransaction.serverId) targetText += ` (${currentTransaction.serverId})`;
    document.getElementById('sum-target').innerText = targetText;

    document.getElementById('sum-price').innerText = `Rp ${currentTransaction.selectedItemPrice.toLocaleString('id-ID')}`;

    // Pindah ke Halaman 3
    goToPage(3);
}

// Proses Pembayaran dari Halaman 3 -> Masuk ke Halaman 4 (Diproses) -> Otomatis ke Halaman 5 (Berhasil)
function processCheckout() {
    // Ambil metode pembayaran yang dipilih
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        alert("Pilih metode pembayaran terlebih dahulu!");
        return;
    }
    currentTransaction.paymentMethod = selectedPayment.value;

    // Pindah ke Halaman 4 (Sedang Diproses)
    goToPage(4);

    // Simulasi jeda waktu sistem memproses pembayaran (3 detik)
    setTimeout(() => {
        // Set Data Struk di Halaman 5
        const randomReceiptId = 'VZ-' + Math.floor(100000000 + Math.random() * 900000000);
        document.getElementById('rec-id').innerText = randomReceiptId;
        document.getElementById('rec-product').innerText = currentTransaction.productName;
        document.getElementById('rec-item').innerText = currentTransaction.selectedItemName;
        
        let targetText = currentTransaction.userId;
        if (currentTransaction.serverId) targetText += ` (${currentTransaction.serverId})`;
        document.getElementById('rec-target').innerText = targetText;

        document.getElementById('rec-payment').innerText = currentTransaction.paymentMethod;
        document.getElementById('rec-price').innerText = `Rp ${currentTransaction.selectedItemPrice.toLocaleString('id-ID')}`;

        // Pindah ke Halaman 5 (Berhasil)
        goToPage(5);
    }, 3000);
}

// Reset transaksi untuk kembali berbelanja dari awal
function resetStore() {
    currentTransaction = {
        productName: "",
        productType: "",
        userId: "",
        serverId: "",
        selectedItemName: "",
        selectedItemPrice: 0,
        paymentMethod: ""
    };
    document.getElementById('user-id-input').value = '';
    document.getElementById('server-id-input').value = '';
    goToPage(1);
}
