import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [templatepProduct, setTemplateProduct] = useState(
    INITIAL_TEMPLATE_DATA,
  );

  const [modalType, setModalType] = useState("");

  const productModalRef = useRef(null);

  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      alert(error.response?.data.message || "取得產品失敗");
    }
  }, []);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }

    (async () => await getProducts())();

    productModalRef.current = new Modal("#productModal", {
      keyboard: false,
    });

    // Modal 關閉時移除焦點
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
  }, [getProducts]);

  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct((preData) => ({
      ...preData,
      ...product,
    }));

    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((preData) => {
      const newImages = [...preData.imagesUrl];
      newImages[index] = value;

      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
        newImages.pop();
      }

      return {
        ...preData,
        imagesUrl: newImages,
      };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((preData) => {
      const newImages = [...preData.imagesUrl];
      newImages.push("");
      return {
        ...preData,
        imagesUrl: newImages,
      };
    });
  };

  const handleRemoveImage = () => {
    setTemplateProduct((preData) => {
      const newImages = [...preData.imagesUrl];
      newImages.pop();
      return {
        ...preData,
        imagesUrl: newImages,
      };
    });
  };

  const updateProduct = async (id) => {
    let url;
    let method;

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    } else if (modalType === "create") {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = "post";
    }

    const productData = {
      data: {
        ...templatepProduct,
        origin_price: Number(templatepProduct.origin_price),
        price: Number(templatepProduct.price),
        is_enabled: templatepProduct.is_enabled ? 1 : 0,
        imagesUrl: templatepProduct.imagesUrl.filter((url) => url !== ""),
      },
    };

    try {
      await axios[method](url, productData);
      getProducts();
      closeModal();
    } catch (error) {
      alert(
        error.response?.data.message || method === "post"
          ? "產品新增失敗"
          : "產品更新失敗",
      );
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      getProducts();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "刪除產品失敗");
    }
  };

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-3">產品列表</h2>
        <div className="text-end mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
          >
            建立新的產品
          </button>
        </div>
        <table className="table text-center">
          <thead>
            <tr>
              <th scope="col">分類</th>
              <th scope="col">產品名稱</th>
              <th scope="col">原價</th>
              <th scope="col">售價</th>
              <th scope="col">是否啟用</th>
              <th scope="col">編輯</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.category}</td>
                <td>{product.title}</td>
                <td>{product.origin_price}</td>
                <td>{product.price}</td>
                <td className={`${product.is_enabled && "text-success"}`}>
                  {product.is_enabled ? "啟用" : "未啟用"}
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openModal("edit", product)}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => openModal("delete", product)}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="productModal"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div
          className={`modal-dialog ${modalType === "delete" ? "" : "modal-xl"}`}
        >
          <div className="modal-content">
            <div
              className={`modal-header bg-${
                modalType === "delete" ? "danger" : "dark"
              } text-white`}
            >
              <h1 className="modal-title fs-5" id="productModalLabel">
                {modalType === "delete"
                  ? "刪除"
                  : modalType === "edit"
                    ? "編輯"
                    : "新增"}
                產品
              </h1>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              {modalType === "delete" ? (
                <p className="fs-4">
                  確定要刪除
                  <span className="text-danger">{templatepProduct.title}</span>
                  嗎？
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-2">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          value={templatepProduct.imageUrl}
                          placeholder="請輸入圖片連結"
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      {templatepProduct.imageUrl && (
                        <img
                          className="img-fluid mb-3"
                          src={templatepProduct.imageUrl}
                          alt="主圖"
                        />
                      )}
                    </div>
                    <div>
                      {templatepProduct.imagesUrl?.map((url, index) => (
                        <div key={index} className="mb-3">
                          <label htmlFor="imageUrl" className="form-label">
                            圖片{index + 1}
                          </label>
                          <input
                            type="text"
                            className="form-control mb-2"
                            value={url}
                            placeholder={`圖片網址${index + 1}`}
                            onChange={(e) =>
                              handleModalImageChange(index, e.target.value)
                            }
                          />
                          {url && (
                            <img
                              className="img-fluid"
                              src={url}
                              alt={`副圖${index + 1}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      {templatepProduct.imagesUrl.length < 5 &&
                        templatepProduct.imagesUrl[
                          templatepProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm d-block w-100"
                            onClick={handleAddImage}
                          >
                            新增圖片
                          </button>
                        )}

                      {templatepProduct.imagesUrl.length > 0 && (
                        <button
                          className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={handleRemoveImage}
                        >
                          刪除圖片
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        value={templatepProduct.title}
                        placeholder="請輸入標題"
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          value={templatepProduct.category}
                          placeholder="請輸入分類"
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          value={templatepProduct.unit}
                          placeholder="請輸入單位"
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">
                          原價
                        </label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          value={templatepProduct.origin_price}
                          placeholder="請輸入原價"
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          value={templatepProduct.price}
                          placeholder="請輸入售價"
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        value={templatepProduct.description}
                        placeholder="請輸入產品描述"
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        value={templatepProduct.content}
                        placeholder="請輸入說明內容"
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templatepProduct.is_enabled}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="is_enabled"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === "delete" ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => deleteProduct(templatepProduct.id)}
                >
                  刪除
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateProduct(templatepProduct.id)}
                  >
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
