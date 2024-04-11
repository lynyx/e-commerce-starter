const deleteProduct = async (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
  try {
    await fetch(`/admin/product/${prodId}`, {
      method: 'DELETE',
      headers: {
        "psifi.x-csrf-token": csrf,
      },
    });
    
    btn.closest('.product-item').remove();
  } catch (e) {
    console.error(e);
  }
}

document.querySelectorAll('.delete-product-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    await deleteProduct(this);
  });
});
